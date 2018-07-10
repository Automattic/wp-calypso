# @wordpress/is-shallow-equal

A function for performing a shallow comparison between two objects or arrays. Two values have shallow equality when all of their members are strictly equal to the corresponding member of the other.

## Usage

The default export of `@wordpress/is-shallow-equal` is a function which accepts two objects or arrays:

```js
import isShallowEqual from '@wordpress/is-shallow-equal';

isShallowEqual( { a: 1 }, { a: 1, b: 2 } );
// ⇒ false

isShallowEqual( { a: 1 }, { a: 1 } );
// ⇒ true

isShallowEqual( [ 1 ], [ 1, 2 ] );
// ⇒ false

isShallowEqual( [ 1 ], [ 1 ] );
// ⇒ true
```

You can import a specific implementation if you already know the types of values you are working with:

```js
import isShallowEqualArrays from '@wordpress/is-shallow-equal/arrays';
import isShallowEqualObjects from '@wordpress/is-shallow-equal/objects';
```

## Rationale

Shallow equality utilities are already a dime a dozen. Since these operations are often at the core of critical hot code paths, the WordPress contributors had specific requirements that were found to only be partially satisfied by existing solutions.

In particular, it should…

1. …consider non-primitive yet referentially-equal members values as equal.
   - Eliminates [`is-equal-shallow`](https://www.npmjs.com/package/is-equal-shallow) as an option.
2. …offer a single function through which to interface, regardless of value type.
   - Eliminates [`shallow-equal`](https://www.npmjs.com/package/shallow-equal) as an option.
3. …be barebones; only providing the basic functionality of shallow equality.
   - Eliminates [`shallow-equals`](https://www.npmjs.com/package/shallow-equals) as an option.
4. …anticipate and optimize for referential sameness as equal.
   - Eliminates [`is-equal-shallow`](https://www.npmjs.com/package/is-equal-shallow) and [`shallow-equals`](https://www.npmjs.com/package/shallow-equals) as options.
5. …be intended for use in non-Facebook projects.
   - Eliminates [`fbjs/lib/shallowEqual`](https://www.npmjs.com/package/fbjs) as an option.
6. …be the most performant implementation.
   - See [Benchmarks](#benchmarks).

## Benchmarks

The following results were produced under Node v8.11.1 (LTS) on a MacBook Pro (Late 2016) 2.9 GHz Intel Core i7.

>`@wordpress/is-shallow-equal (type specific) (object, equal) x 4,902,162 ops/sec ±0.40% (89 runs sampled)`  
>`@wordpress/is-shallow-equal (type specific) (object, same) x 558,234,287 ops/sec ±0.28% (92 runs sampled)`  
>`@wordpress/is-shallow-equal (type specific) (object, unequal) x 5,062,890 ops/sec ±0.71% (90 runs sampled)`  
>`@wordpress/is-shallow-equal (type specific) (array, equal) x 70,419,519 ops/sec ±0.56% (86 runs sampled)`  
>`@wordpress/is-shallow-equal (type specific) (array, same) x 561,159,444 ops/sec ±0.33% (91 runs sampled)`  
>`@wordpress/is-shallow-equal (type specific) (array, unequal) x 37,299,061 ops/sec ±0.89% (86 runs sampled)`  
>
>`@wordpress/is-shallow-equal (object, equal) x 4,449,938 ops/sec ±0.34% (91 runs sampled)`  
>`@wordpress/is-shallow-equal (object, same) x 516,101,448 ops/sec ±0.64% (90 runs sampled)`  
>`@wordpress/is-shallow-equal (object, unequal) x 4,925,231 ops/sec ±0.28% (91 runs sampled)`  
>`@wordpress/is-shallow-equal (array, equal) x 30,432,490 ops/sec ±0.80% (86 runs sampled)`  
>`@wordpress/is-shallow-equal (array, same) x 505,206,883 ops/sec ±0.37% (93 runs sampled)`  
>`@wordpress/is-shallow-equal (array, unequal) x 33,590,955 ops/sec ±0.96% (86 runs sampled)`  
>
>`shallowequal (object, equal) x 3,407,788 ops/sec ±0.46% (93 runs sampled)`  
>`shallowequal (object, same) x 494,715,603 ops/sec ±0.42% (91 runs sampled)`  
>`shallowequal (object, unequal) x 3,575,393 ops/sec ±0.54% (93 runs sampled)`  
>`shallowequal (array, equal) x 1,530,453 ops/sec ±0.32% (92 runs sampled)`  
>`shallowequal (array, same) x 489,793,575 ops/sec ±0.60% (90 runs sampled)`  
>`shallowequal (array, unequal) x 1,534,574 ops/sec ±0.32% (90 runs sampled)`  
>
>`shallow-equal (type specific) (object, equal) x 4,708,043 ops/sec ±0.30% (92 runs sampled)`  
>`shallow-equal (type specific) (object, same) x 537,831,873 ops/sec ±0.42% (88 runs sampled)`  
>`shallow-equal (type specific) (object, unequal) x 4,859,249 ops/sec ±0.28% (90 runs sampled)`  
>`shallow-equal (type specific) (array, equal) x 63,985,372 ops/sec ±0.54% (91 runs sampled)`  
>`shallow-equal (type specific) (array, same) x 540,675,335 ops/sec ±0.43% (89 runs sampled)`  
>`shallow-equal (type specific) (array, unequal) x 34,613,490 ops/sec ±0.81% (90 runs sampled)`  
>
>`is-equal-shallow (object, equal) x 2,798,059 ops/sec ±0.42% (93 runs sampled)`  
>`is-equal-shallow (object, same) x 2,844,934 ops/sec ±0.39% (93 runs sampled)`  
>`is-equal-shallow (object, unequal) x 3,223,288 ops/sec ±0.57% (92 runs sampled)`  
>`is-equal-shallow (array, equal) x 1,060,093 ops/sec ±0.32% (93 runs sampled)`  
>`is-equal-shallow (array, same) x 1,058,977 ops/sec ±0.31% (94 runs sampled)`  
>`is-equal-shallow (array, unequal) x 1,697,517 ops/sec ±0.28% (91 runs sampled)`  
>
>`shallow-equals (object, equal) x 4,457,325 ops/sec ±0.40% (92 runs sampled)`  
>`shallow-equals (object, same) x 4,509,250 ops/sec ±0.48% (92 runs sampled)`  
>`shallow-equals (object, unequal) x 4,856,327 ops/sec ±0.41% (94 runs sampled)`  
>`shallow-equals (array, equal) x 44,915,371 ops/sec ±2.18% (79 runs sampled)`  
>`shallow-equals (array, same) x 38,514,418 ops/sec ±1.25% (83 runs sampled)`  
>`shallow-equals (array, unequal) x 24,319,893 ops/sec ±0.96% (84 runs sampled)`  
>
>`fbjs/lib/shallowEqual (object, equal) x 3,388,692 ops/sec ±0.72% (92 runs sampled)`  
>`fbjs/lib/shallowEqual (object, same) x 139,559,732 ops/sec ±4.45% (32 runs sampled)`  
>`fbjs/lib/shallowEqual (object, unequal) x 3,480,571 ops/sec ±0.51% (90 runs sampled)`  
>`fbjs/lib/shallowEqual (array, equal) x 1,517,044 ops/sec ±0.42% (91 runs sampled)`  
>`fbjs/lib/shallowEqual (array, same) x 134,032,009 ops/sec ±2.82% (46 runs sampled)`  
>`fbjs/lib/shallowEqual (array, unequal) x 1,532,376 ops/sec ±0.41% (91 runs sampled)`  

You can run the benchmarks yourselves by cloning the repository, installing dependencies, and running the `benchmark/index.js` script:

```
git clone https://github.com/WordPress/packages.git
cd packages/packages/is-shallow-equal
npm install
node benchmark
```

<br/><br/><p align="center"><img src="https://s.w.org/style/images/codeispoetry.png?1" alt="Code is Poetry." /></p>
