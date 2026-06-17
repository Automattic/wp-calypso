# Third-Party Notices

This package incorporates code from third-party open-source projects. Their
original copyright notices and license terms are reproduced below.

## GrowthBook JavaScript SDK

Portions of this package are derived from GrowthBook's open-source SDK
(<https://github.com/growthbook/growthbook>, `packages/sdk-js`), used under
the MIT License:

- `src/sdk/hash.ts` — FNV-1a 32-bit hash and the double-FNV `[0, 1)` mapping
  (from `packages/sdk-js/src/util.ts`).
- `src/sdk/bucket.ts` — `getEqualWeights`, `getBucketRanges`, `inRange`, and
  `chooseVariation` (from `packages/sdk-js/src/util.ts`), including the
  coverage clamp and the `[0.99, 1.01]` weight-sum tolerance fallback.
- `src/sdk/condition.ts` — top-level `$and`/`$or` evaluation and the
  `$eq`/`$in`/`$exists` operator object plus string/array shorthands, a
  reduced subset of `packages/sdk-js/src/mongrule.ts`.

```
MIT License

Copyright (c) 2025 GrowthBook, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
