import { DomainPriceRule } from '../../hooks/use-suggestion';
import { NamePulseDomainStatus, type NamePulseDomainResult, type NamePulseSource } from './types';
import type { DomainSuggestion } from '@automattic/api-core';

export type NamePulseSectionId = 'top' | 'exact' | 'suggestions' | 'creative';

/**
 * `exact` is the typed domain's card and `exact_tlds` the typed name with
 * other endings; the rest match their section headings.
 */
export type NamePulseResultGroup = 'exact' | 'top' | 'exact_tlds' | 'related' | 'creative';

const NAME_PULSE_RESULT_GROUPS: Record< NamePulseSectionId, NamePulseResultGroup > = {
	top: 'top',
	exact: 'exact_tlds',
	suggestions: 'related',
	creative: 'creative',
};

export const getNamePulseResultGroup = ( section: NamePulseSectionId ) =>
	NAME_PULSE_RESULT_GROUPS[ section ];

export const getNamePulseTracksVendor = ( source: NamePulseSource ) => `name_pulse_${ source }`;

/** Shaped like a classic suggestion, which the TrainTracks events read. */
export const toNamePulseTracksSuggestion = (
	result: Pick<
		NamePulseDomainResult,
		'domain_name' | 'source' | 'is_premium' | 'cost' | 'raw_price' | 'currency_code'
	>,
	position: number
): DomainSuggestion & { position: number; price_rule: DomainPriceRule } => ( {
	domain_name: result.domain_name,
	cost: result.cost ?? '',
	raw_price: result.raw_price ?? 0,
	currency_code: result.currency_code ?? '',
	product_id: 0,
	product_slug: 'domain_registration',
	relevance: 1,
	max_reg_years: 10,
	multi_year_reg_allowed: true,
	supports_privacy: true,
	vendor: getNamePulseTracksVendor( result.source ),
	...( result.is_premium ? { is_premium: true as const } : {} ),
	position,
	price_rule: DomainPriceRule.PRICE,
} );

export const getNamePulseRenderTracksProps = (
	result: Pick< NamePulseDomainResult, 'source' | 'status' >,
	{
		resultSetId,
		railcar,
		group,
	}: { resultSetId: string; railcar: string; group: NamePulseResultGroup }
) => {
	let availability = 'unknown';

	if ( result.status === NamePulseDomainStatus.AVAILABLE ) {
		availability = 'available';
	} else if ( result.status === NamePulseDomainStatus.TAKEN ) {
		availability = 'unavailable';
	}

	return {
		railcar,
		result_set_id: resultSetId,
		result_group: group,
		is_ai_generated: result.source === 'ai',
		availability_at_render: availability,
	};
};
