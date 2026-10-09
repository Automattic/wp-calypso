import { DomainPriceRule } from '../../hooks/use-suggestion';
import { NamePulseDomainStatus, type NamePulseDomainResult, type NamePulseSource } from './types';
import type { DomainSuggestion } from '@automattic/api-core';

/**
 * Sent as `calypso_domain_search_name_pulse_<name>`. The event list and its
 * props are documented in the Name Pulse README.
 */
export type NamePulseTracksEventName =
	| 'search_settled'
	| 'results_rendered'
	| 'search_cleared'
	| 'show_more_click'
	| 'result_add_to_cart'
	| 'result_remove_from_cart'
	| 'availability_failed'
	| 'suggestions_failed';

export type NamePulseTracksProps = Record< string, string | number | boolean | undefined >;

/** Matches the `data-section` of each results section, plus the full-domain card. */
export type NamePulseTracksSection = 'top' | 'exact' | 'suggestions' | 'creative' | 'exact_card';

/** Stands in for `root_vendor` on the classic events, which only know `availability` otherwise. */
export const getNamePulseTracksVendor = ( source: NamePulseSource ) => `name_pulse_${ source }`;

/**
 * The classic render and interact events expect a suggestion from the classic
 * results. Only the fields they read are meaningful here.
 */
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

/** Props shared by every event about one result. */
export const getNamePulseResultTracksProps = (
	result: Pick<
		NamePulseDomainResult,
		'suffix' | 'source' | 'status' | 'is_premium' | 'raw_price' | 'currency_code'
	>,
	section: NamePulseTracksSection,
	position: number
): NamePulseTracksProps => ( {
	results_section: section,
	position,
	tld: result.suffix,
	name_pulse_source: result.source,
	availability_status: NamePulseDomainStatus[ result.status ].toLowerCase(),
	is_premium: !! result.is_premium,
	raw_price: result.raw_price,
	currency_code: result.currency_code,
} );
