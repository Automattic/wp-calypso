/*
 * The condition-evaluation logic below (top-level `$and`/`$or` handling,
 * `$eq`/`$in`/`$exists` operator object, and string/array shorthands) is
 * derived from GrowthBook's open-source SDK
 * (https://github.com/growthbook/growthbook), used under the MIT License.
 * Copyright (c) 2025 GrowthBook, Inc. Full MIT license text in
 * `THIRD_PARTY_NOTICES.md` at the package root.
 */

import type { Attributes } from './types';

/**
 * Evaluate a condition document against an attribute map.
 *
 * Top-level entries are ANDed together — `{ "$or": [...], "country": "US" }`
 * means *both* the `$or` and the `country` predicate must pass.
 */
export function evalCondition( attrs: Attributes, cond: unknown ): boolean {
	if ( typeof cond !== 'object' || cond === null ) {
		return false;
	}

	for ( const [ field, expr ] of Object.entries( cond as Record< string, unknown > ) ) {
		if ( field === '$and' ) {
			if ( ! Array.isArray( expr ) || expr.length === 0 ) {
				return false;
			}
			if ( ! expr.every( ( child ) => evalCondition( attrs, child ) ) ) {
				return false;
			}
			continue;
		}

		if ( field === '$or' ) {
			if ( ! Array.isArray( expr ) || expr.length === 0 ) {
				return false;
			}
			if ( ! expr.some( ( child ) => evalCondition( attrs, child ) ) ) {
				return false;
			}
			continue;
		}

		if ( field.startsWith( '$' ) ) {
			return false;
		}

		if ( ! evalField( attrs, field, expr ) ) {
			return false;
		}
	}

	return true;
}

/**
 * Evaluate a single field predicate.
 *
 * Shorthands:
 * - `{ field: "literal" }` → `{ field: { $eq: "literal" } }`
 * - `{ field: ["a", "b"] }` → `{ field: { $in: ["a", "b"] } }`
 *
 * Object form supports `$eq`, `$in`, `$exists`. Anything else is unknown
 * and emits a structured warning + non-match.
 */
function evalField( attrs: Attributes, field: string, expr: unknown ): boolean {
	const rawValue = ( attrs as Record< string, string | null | undefined > )[ field ];
	// "Exists" means non-null — explicit null and missing key share state.
	const present = rawValue !== undefined && rawValue !== null;
	const value = present ? rawValue : null;

	if ( typeof expr === 'string' ) {
		return present && value === expr;
	}

	if ( Array.isArray( expr ) ) {
		return present && expr.includes( value );
	}

	if ( typeof expr !== 'object' || expr === null ) {
		return false;
	}

	const entries = Object.entries( expr as Record< string, unknown > );
	// Empty operator object: PHP decodes `{}` as an empty associative array
	// and falls through to the empty-list `$in` shorthand, which is non-match.
	// Mirror that here so the runtimes agree.
	if ( entries.length === 0 ) {
		return false;
	}

	for ( const [ op, arg ] of entries ) {
		switch ( op ) {
			case '$eq':
				if ( ! present || value !== arg ) {
					return false;
				}
				break;

			case '$in':
				if ( ! Array.isArray( arg ) || ! present || ! arg.includes( value ) ) {
					return false;
				}
				break;

			case '$exists':
				if ( typeof arg !== 'boolean' || arg !== present ) {
					return false;
				}
				break;

			default:
				return false;
		}
	}

	return true;
}
