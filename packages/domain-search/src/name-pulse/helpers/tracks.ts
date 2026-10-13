import { DomainPriceRule } from '../../hooks/use-suggestion';
import { NamePulseDomainStatus, type NamePulseDomainResult, type NamePulseSource } from './types';
import type { DomainSuggestion } from '@automattic/api-core';

/** The `data-section` of each results section. */
export type NamePulseSectionId = 'top' | 'exact' | 'suggestions' | 'creative';

/** The heading a result is shown under, as sent in `result_group`. */
export type NamePulseResultGroup = 'featured' | 'top' | 'exact' | 'related' | 'creative';

export const getNamePulseResultGroup = ( section: NamePulseSectionId ): NamePulseResultGroup =>
	section === 'suggestions' ? 'related' : section;

export const getNamePulseTracksVendor = ( source: NamePulseSource ) => `name_pulse_${ source }`;

/** A result shaped like the classic suggestion the TrainTracks events read. */
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

/** What Name Pulse adds to `calypso_traintracks_render`. */
export const getNamePulseRenderTracksProps = (
	result: Pick< NamePulseDomainResult, 'source' | 'status' >,
	group: NamePulseResultGroup,
	resultSetId: string
) => {
	let availability = 'unknown';

	if ( result.status === NamePulseDomainStatus.AVAILABLE ) {
		availability = 'available';
	} else if ( result.status === NamePulseDomainStatus.TAKEN ) {
		availability = 'unavailable';
	}

	return {
		result_set_id: resultSetId,
		result_group: group,
		is_ai_generated: result.source === 'ai',
		availability_at_render: availability,
	};
};
