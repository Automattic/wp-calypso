import { ExPlatSdk } from '@automattic/explat-client';
import { Button, RadioControl } from '@wordpress/components';
import { useEffect, useState } from 'react';
import { exPlatDevtools } from 'calypso/lib/explat';

type FeatureValue = ExPlatSdk.FeatureValue;
type Attributes = ExPlatSdk.Attributes;
type RawRule = Record< string, unknown >;
type RawFeature = { rules?: unknown };

type RuleSummary =
	| { index: number; type: 'force'; value: FeatureValue; condition: unknown | null }
	| {
			index: number;
			type: 'experiment';
			experimentId: number;
			hashAttribute: string;
			condition: unknown | null;
			variations: Array< { name: string; value: FeatureValue } >;
	  };

/**
 * Match the eval result back to a rule in the flag's rules array. Force-rule
 * matches are ambiguous (a payload could have multiple force rules with the
 * same value), so this is best-effort: we mark the first force rule whose
 * value matches when source is 'force'. Experiment matches are unambiguous
 * via experiment_id.
 */
function isMatchedRule( rule: RuleSummary, preview: ExPlatSdk.Result | null ): boolean {
	if ( ! preview ) {
		return false;
	}
	if ( preview.source === 'experiment' && rule.type === 'experiment' ) {
		return rule.experimentId === preview.experiment_id;
	}
	if ( preview.source === 'force' && rule.type === 'force' ) {
		return JSON.stringify( rule.value ) === JSON.stringify( preview.value );
	}
	return false;
}

/** Whether the user qualifies for this rule's audience condition. `null` means we don't know yet (attributes still loading). */
function ruleQualifies( rule: RuleSummary, attributes: Attributes | null ): boolean | null {
	if ( attributes === null ) {
		return null;
	}
	if ( rule.condition === null || rule.condition === undefined ) {
		return true;
	}
	return ExPlatSdk.evalCondition( attributes, rule.condition as ExPlatSdk.Condition );
}

function ruleQualClass( qualifies: boolean | null ): string {
	if ( qualifies === null ) {
		return '';
	}
	return qualifies ? ' is-qualifies' : ' is-no-qualify';
}

function RuleMarker( { matched, qualifies }: { matched: boolean; qualifies: boolean | null } ) {
	if ( matched ) {
		return (
			<span className="explat-helper__rule-marker" title="Matched (resolved this flag)">
				▶
			</span>
		);
	}
	if ( qualifies === true ) {
		return (
			<span
				className="explat-helper__rule-marker is-qualifies"
				title="You qualify (condition matches), but an earlier rule resolved first"
			>
				✓
			</span>
		);
	}
	if ( qualifies === false ) {
		return (
			<span
				className="explat-helper__rule-marker is-no-qualify"
				title="You don't qualify (condition does not match)"
			>
				✕
			</span>
		);
	}
	return null;
}

interface Props {
	flagKey: string;
	forcedValue: FeatureValue | undefined;
	isForced: boolean;
}

const AUTO_SENTINEL = '__explat_helper_auto__';

/**
 * Encode arbitrary FeatureValue (string | boolean | number | nested) into a
 * stable string for use as a radio option's `value` prop. Decoded on select.
 */
function encode( v: FeatureValue ): string {
	return JSON.stringify( v );
}
function decode( s: string ): FeatureValue {
	return JSON.parse( s ) as FeatureValue;
}

function bucketingSkippedReason(
	canHash: boolean,
	conditionMatches: boolean,
	hashAttribute: string
): string | null {
	if ( ! canHash ) {
		return `no hash value for ${ hashAttribute }`;
	}
	if ( ! conditionMatches ) {
		return 'audience condition does not match';
	}
	return null;
}

function describeSource( source: string | undefined, isForced: boolean ): string {
	if ( isForced ) {
		return 'forced';
	}
	switch ( source ) {
		case 'experiment':
			return 'experiment';
		case 'force':
			return 'force rule';
		case 'default':
			return 'default';
		default:
			return 'unevaluated';
	}
}

export default function FlagRow( { flagKey, forcedValue, isForced }: Props ) {
	const [ preview, setPreview ] = useState< ExPlatSdk.Result | null >( null );
	const [ attributes, setAttributes ] = useState< Attributes | null >( null );

	// Run preview + load attributes on mount + whenever forced state for this
	// flag changes. Both feed the rule-qualification UI: `preview` tells us
	// which rule actually resolved the value, `attributes` lets us check
	// `evalCondition(attrs, rule.condition)` per rule to color the others.
	useEffect( () => {
		let cancelled = false;
		Promise.all( [
			exPlatDevtools.previewFeatureValue( flagKey ),
			exPlatDevtools.getEvaluationAttributes(),
		] ).then( ( [ r, a ] ) => {
			if ( ! cancelled ) {
				setPreview( r );
				setAttributes( a );
			}
		} );
		return () => {
			cancelled = true;
		};
	}, [ flagKey, isForced ] );

	const flagInfo = exPlatDevtools.getFlagInfo( flagKey );

	// Walk rules in order, mirroring `evalFeature`, and log per-rule
	// qualification + experiment hash/score/bucket so devs can see exactly
	// *why* the engine returned what it did. As soon as one rule resolves
	// naturally, every subsequent rule is `not_reached`.
	useEffect( () => {
		if ( ! flagInfo || ! attributes ) {
			return;
		}
		const raw = exPlatDevtools.getRawFeature( flagKey ) as RawFeature | null;
		const rawRules: RawRule[] = Array.isArray( raw?.rules ) ? raw?.rules ?? [] : [];

		let resolved = false;
		const ruleTrace = flagInfo.rules.map( ( rule ) => {
			// `attributes` is non-null here (early-return above), so this is `boolean`.
			const conditionMatches = ruleQualifies( rule, attributes ) as boolean;
			const naturallyMatched = isMatchedRule( rule, preview );

			const processed = ! resolved;

			if ( rule.type === 'force' ) {
				let outcome: 'matched' | 'skipped_condition' | 'not_reached';
				if ( ! processed ) {
					outcome = 'not_reached';
				} else if ( ! conditionMatches ) {
					outcome = 'skipped_condition';
				} else {
					outcome = 'matched';
					resolved = true;
				}
				return {
					index: rule.index,
					type: 'force' as const,
					qualifies: conditionMatches,
					matched: naturallyMatched,
					processed,
					engine_outcome: outcome,
					condition: rule.condition,
					value: rule.value,
				};
			}

			// Experiment rule — surface the deterministic eval inputs + outputs.
			const rawRule = rawRules[ rule.index ] ?? {};
			const seed = typeof rawRule.seed === 'string' ? rawRule.seed : '';
			const ranges: Array< [ number, number ] > = Array.isArray( rawRule.ranges )
				? ( rawRule.ranges as Array< [ number, number ] > )
				: [];
			const hashValue = attributes[ rule.hashAttribute as keyof typeof attributes ];
			const canHash = typeof hashValue === 'string' && hashValue.length > 0;
			const hashScore = canHash ? ExPlatSdk.hash( seed, hashValue as string ) : null;
			const chosenIndex =
				hashScore !== null
					? ranges.findIndex( ( [ lo, hi ] ) => hashScore >= lo && hashScore < hi )
					: -1;
			const variationsWithRanges = rule.variations.map( ( v, i ) => ( {
				name: v.name,
				value: v.value,
				range: ranges[ i ] ?? null,
			} ) );

			let outcome:
				| 'matched'
				| 'skipped_condition'
				| 'skipped_no_hash_value'
				| 'skipped_out_of_range'
				| 'not_reached';
			if ( ! processed ) {
				outcome = 'not_reached';
			} else if ( ! conditionMatches ) {
				outcome = 'skipped_condition';
			} else if ( ! canHash ) {
				outcome = 'skipped_no_hash_value';
			} else if ( chosenIndex < 0 ) {
				outcome = 'skipped_out_of_range';
			} else {
				outcome = 'matched';
				resolved = true;
			}

			return {
				index: rule.index,
				type: 'experiment' as const,
				qualifies: conditionMatches,
				matched: naturallyMatched,
				processed,
				engine_outcome: outcome,
				condition: rule.condition,
				experiment_id: rule.experimentId,
				seed,
				hash_attribute: rule.hashAttribute,
				hash_value: typeof hashValue === 'string' ? hashValue : null,
				hash_score: hashScore,
				variations: variationsWithRanges,
				chosen_variation_index: chosenIndex >= 0 ? chosenIndex : null,
				chosen_variation: chosenIndex >= 0 ? variationsWithRanges[ chosenIndex ] : null,
				bucketing_skipped_reason: bucketingSkippedReason(
					canHash,
					conditionMatches,
					rule.hashAttribute
				),
			};
		} );

		const naturalValue = preview?.value ?? flagInfo.defaultValue;
		const naturalSource = preview?.source ?? 'default';
		// eslint-disable-next-line no-console
		console.log( `[ExPlat] ${ flagKey } rule trace`, {
			flag_key: flagKey,
			attributes,
			rules: ruleTrace,
			natural: {
				matched_rule_index:
					ruleTrace.find( ( r ) => r.engine_outcome === 'matched' )?.index ?? null,
				value: naturalValue,
				source: naturalSource,
			},
			override: {
				is_forced: isForced,
				forced_value: isForced ? forcedValue : undefined,
			},
			effective: {
				value: isForced ? forcedValue : naturalValue,
				source: isForced ? 'override' : naturalSource,
			},
		} );
	}, [ flagKey, preview, attributes, flagInfo, isForced, forcedValue ] );

	const previewValue = preview?.value;

	// Build radio options:
	//  - "Auto: <preview>" — natural eval (un-forced). Selected when no override.
	//  - One option per defined variation, labelled "<name>: <value>" so the
	//    semantic name and rendered value are both visible.
	//  - Trailing "<value> (custom)" if the forced value isn't in the defined set.
	const options = [
		{
			label:
				previewValue !== undefined ? `Auto: ${ String( previewValue ) }` : 'Auto: (no preview)',
			value: AUTO_SENTINEL,
		},
		...( flagInfo?.variations ?? [] ).map( ( v ) => ( {
			label: v.name === String( v.value ) ? v.name : `${ v.name }: ${ String( v.value ) }`,
			value: encode( v.value ),
		} ) ),
	];

	// If a forced value isn't represented in `variations`, append a
	// synthetic option labelled with the raw value so the radio reflects state.
	if ( isForced && forcedValue !== undefined ) {
		const encoded = encode( forcedValue );
		if ( ! options.some( ( o ) => o.value === encoded ) ) {
			options.push( {
				label: `${ String( forcedValue ) } (custom)`,
				value: encoded,
			} );
		}
	}

	const selected = isForced && forcedValue !== undefined ? encode( forcedValue ) : AUTO_SENTINEL;

	const onSelect = ( value: string ) => {
		if ( value === AUTO_SENTINEL ) {
			exPlatDevtools.forcedFeatures.clear( flagKey );
		} else {
			exPlatDevtools.forcedFeatures.set( flagKey, decode( value ) );
		}
	};

	const sourceLabel = describeSource( preview?.source, isForced );

	return (
		<li className="explat-helper__flag-row">
			<div className="explat-helper__flag-header">
				<code className="explat-helper__flag-name">{ flagKey }</code>
				<span
					className={ `explat-helper__source explat-helper__source-${ sourceLabel.replace(
						' ',
						'-'
					) }` }
				>
					{ sourceLabel }
				</span>
			</div>
			{ flagInfo && flagInfo.rules.length > 0 && (
				<details className="explat-helper__rules">
					<summary>
						{ flagInfo.rules.length } rule{ flagInfo.rules.length === 1 ? '' : 's' }
						{ ' · default: ' }
						<code>{ JSON.stringify( flagInfo.defaultValue ) }</code>
					</summary>
					<ol className="explat-helper__rules-list">
						{ flagInfo.rules.map( ( rule ) => {
							// Highlight rules based on natural eval only. Forcing a value
							// changes which value renders, but it doesn't mean the user
							// qualifies for any particular rule's audience — so we don't
							// promote a rule to "matched" just because it contains the
							// forced variation value.
							const matched = isMatchedRule( rule, preview );
							const qualifies = ruleQualifies( rule, attributes );
							const matchedClass = matched ? ' is-matched' : '';
							return (
								<li
									key={ rule.index }
									className={ `explat-helper__rule${ matchedClass }${ ruleQualClass(
										qualifies
									) }` }
								>
									<RuleMarker matched={ matched } qualifies={ qualifies } />
									<span className="explat-helper__rule-index">#{ rule.index }</span>
									{ rule.type === 'force' ? (
										<>
											<span className="explat-helper__rule-type">force</span>
											<code>{ JSON.stringify( rule.value ) }</code>
										</>
									) : (
										<>
											<span className="explat-helper__rule-type">
												experiment { rule.experimentId }
											</span>
											<span className="explat-helper__rule-detail">
												bucketed by <code>{ rule.hashAttribute }</code>
												{ ' · ' }
												{ rule.variations.map( ( v ) => v.name ).join( ' / ' ) }
											</span>
										</>
									) }
									{ rule.condition !== null && rule.condition !== undefined && (
										<span className="explat-helper__rule-condition">
											when <code>{ JSON.stringify( rule.condition ) }</code>
										</span>
									) }
								</li>
							);
						} ) }
					</ol>
				</details>
			) }
			<RadioControl
				selected={ selected }
				options={ options }
				onChange={ onSelect }
				className="explat-helper__radio"
			/>
			{ isForced && (
				<Button
					variant="tertiary"
					size="small"
					onClick={ () => exPlatDevtools.forcedFeatures.clear( flagKey ) }
				>
					Reset to auto
				</Button>
			) }
		</li>
	);
}
