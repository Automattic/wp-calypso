/*
 * `getEqualWeights`, `getBucketRanges`, `inRange`, and `chooseVariation` below
 * are derived from GrowthBook's open-source SDK
 * (https://github.com/growthbook/growthbook), used under the MIT License.
 * Copyright (c) 2025 GrowthBook, Inc. Full MIT license text in
 * `THIRD_PARTY_NOTICES.md` at the package root.
 */

import type { ExperimentVariation, Range } from './types';

export function getEqualWeights( n: number ): number[] {
	if ( n <= 0 ) {
		return [];
	}
	return Array( n ).fill( 1 / n );
}

/**
 * Build `[start, end)` bucket ranges from variation weights and a coverage cap.
 *
 * 1. Coverage is clamped to `[0, 1]`.
 * 2. If `weights` is missing or its length doesn't equal `numVariations`, fall
 *    back to an equal `1/N` split.
 * 3. If the weights' sum drifts outside `[0.99, 1.01]`, also fall back.
 * 4. Walk the weights cumulatively; each entry becomes
 *    `[cumulative, cumulative + coverage * weight]`.
 */
export function getBucketRanges(
	numVariations: number,
	coverage: number = 1.0,
	weights?: number[] | null
): Range[] {
	if ( numVariations <= 0 ) {
		return [];
	}

	let coverageClamped = coverage;
	if ( coverageClamped < 0 ) {
		coverageClamped = 0;
	} else if ( coverageClamped > 1 ) {
		coverageClamped = 1;
	}

	let resolvedWeights: number[];
	if ( ! Array.isArray( weights ) || weights.length !== numVariations ) {
		resolvedWeights = getEqualWeights( numVariations );
	} else {
		const sum = weights.reduce( ( a, b ) => a + b, 0 );
		if ( sum < 0.99 || sum > 1.01 ) {
			resolvedWeights = getEqualWeights( numVariations );
		} else {
			resolvedWeights = weights;
		}
	}

	let cumulative = 0;
	return resolvedWeights.map< Range >( ( weight ) => {
		const start = cumulative;
		cumulative += weight;
		return [ start, start + coverageClamped * weight ];
	} );
}

/**
 * Inclusive lower, exclusive upper: `n >= range[0] && n < range[1]`.
 */
export function inRange( n: number, range: Range ): boolean {
	return n >= range[ 0 ] && n < range[ 1 ];
}

/**
 * Index of the variation whose inline `range` contains `n`, or `null` if none.
 *
 * Each variation carries an inline `range` tuple; this function walks the
 * variations directly rather than a parallel ranges array so any future
 * per-variation field is a one-place change. Callers treat `null` as "user is
 * outside coverage" — fall through to the next rule, do not crash. The PHP
 * runtime returns the same `null` sentinel and the cross-runtime `cases.json`
 * encodes it the same way, so the contract stays in lockstep.
 */
export function chooseVariation(
	n: number,
	variations: Array< Pick< ExperimentVariation, 'range' > >
): number | null {
	for ( let i = 0; i < variations.length; i++ ) {
		const range = variations[ i ]?.range ?? [ 0, 0 ];
		if ( inRange( n, range ) ) {
			return i;
		}
	}
	return null;
}
