/**
 * @license LGPL-2.1-or-later
 *
 * vite-plugin-deno
 *
 * Copyright (C) 2024 Hans Schallmoser
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301
 * USA or see <https://www.gnu.org/licenses/>.
 */

import { z } from "zod";
import { valid, validRange } from "semver";

export type RecordOrString = string | { [Key: string]: RecordOrString };

export const RecordOrString: z.ZodType<RecordOrString> = z.union([
    z.string(),
    z.record(z.string(), z.lazy(() => RecordOrString)),
]);

const zSemver = z.custom<string>((data) => {
    if (data === "canary" || data === "alpha" || data === "beta") {
        return true;
    }
    if (valid(String(data))) {
        return true;
    }
    console.log(`invalid semver ${data}`);
    return false;
});
const zSemverRange = z.custom<string>((data) => {
    if (data === "canary" || data === "alpha" || data === "beta") {
        return true;
    }
    if (valid(String(data))) {
        return true;
    }
    if (validRange(String(data))) {
        return true;
    }
    console.log(`invalid semver ${data}`);
    return false;
});

export const NPMMeta = z.object({
    name: z.string(),
    "dist-tags": z.object({
        latest: zSemver,
    }),
    versions: z.record(
        zSemver,
        z.object({
            dependencies: z.record(z.string(), zSemverRange).optional(),
            peerDependencies: z.record(z.string(), zSemverRange).optional(),
            exports: z.record(z.string(), RecordOrString).optional(),
            main: z.string().default("index.js"),
            dist: z.object({
                tarball: z.string(),
                integrity: z.string(),
            }),
        }),
    ),
});

export type NPMMeta = z.infer<typeof NPMMeta>;
