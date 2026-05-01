// ExPlat SDK — runtime condition matcher.
//
// Borrows MongoDB-shaped query syntax for familiarity; **no MongoDB anywhere
// in the stack**. The five MVP operators are `$eq`, `$in`, `$exists`, `$and`,
// `$or`. This file is the runtime evaluator only — authoring-time validation
// belongs elsewhere — and never crashes on bad input. Unknown operators yield
// non-match plus a `console.warn`. Cross-runtime parity required (PHP / TS).

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
			warnUnknownOperator( field );
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

	for ( const [ op, arg ] of Object.entries( expr as Record< string, unknown > ) ) {
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
				warnUnknownOperator( op );
				return false;
		}
	}

	return true;
}

/* eslint-disable no-console */
function warnUnknownOperator( operator: string ): void {
	if ( typeof console !== 'undefined' && typeof console.warn === 'function' ) {
		console.warn(
			`[ExPlat SDK] Unknown condition operator ${ operator }; treating rule as non-matching`
		);
	}
}
/* eslint-enable no-console */
