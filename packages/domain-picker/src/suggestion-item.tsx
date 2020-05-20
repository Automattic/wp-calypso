/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useI18n } from '@automattic/react-i18n';
import classnames from 'classnames';
import { sprintf } from '@wordpress/i18n';
import { v4 as uuid } from 'uuid';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

/**
 * Internal dependencies
 */
// import { getSuggestionsVendor } from 'lib/domains/suggestions';

// const DOMAIN_SUGGESTION_VENDOR = getSuggestionsVendor( true );

// TODO: Fix this.
const DOMAIN_SUGGESTION_VENDOR = 'variation4_front';

interface Props {
	suggestion: DomainSuggestion;
	isRecommended?: boolean;
	isSelected?: boolean;
	onSelect: ( domainSuggestion: DomainSuggestion ) => void;
	railcarId: string | undefined;
	// TODO: How to use analytics type here?
	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore
	recordAnalytics?: ( event ) => void;
	uiPosition: number;
	domainSearch: string;
	analyticsFlowId: string;
}

const DomainPickerSuggestionItem: FunctionComponent< Props > = ( {
	suggestion,
	isRecommended = false,
	isSelected = false,
	onSelect,
	railcarId,
	recordAnalytics,
	uiPosition,
	domainSearch,
	analyticsFlowId,
} ) => {
	const { __ } = useI18n();

	const domain = suggestion.domain_name;
	const dotPos = domain.indexOf( '.' );
	const domainName = domain.slice( 0, dotPos );
	const domainTld = domain.slice( dotPos );

	const fetchAlgo = `/domains/search/${ DOMAIN_SUGGESTION_VENDOR }/${ analyticsFlowId }`;
	const [ previousDomain, setPreviousDomain ] = useState< string | undefined >();
	const [ previousRailcarId, setPreviousRailcarId ] = useState< string | undefined >();

	const labelId = uuid();

	useEffect( () => {
		// Only record TrainTracks render event when the domain name and railcarId change.
		// This effectively records the render event only once for each set of search results.
		if (
			domain !== previousDomain &&
			previousRailcarId !== railcarId &&
			railcarId &&
			recordAnalytics
		) {
			recordAnalytics( {
				trainTracksType: 'render',
				fetchAlgo,
				query: domainSearch,
				railcarId,
				result: isRecommended ? domain + '#recommended' : domain,
				uiPosition,
			} );
			setPreviousDomain( domain );
			setPreviousRailcarId( railcarId );
		}
	}, [
		domain,
		domainSearch,
		fetchAlgo,
		isRecommended,
		previousDomain,
		previousRailcarId,
		railcarId,
		uiPosition,
		recordAnalytics,
	] );

	const onDomainSelect = () => {
		// Use previousRailcarId to make sure the select action matches the last rendered railcarId.
		if ( previousRailcarId && recordAnalytics ) {
			recordAnalytics( {
				trainTracksType: 'interact',
				action: 'domain_selected',
				railcarId: previousRailcarId,
			} );
		}
		onSelect( suggestion );
	};

	return (
		<label className="domain-picker__suggestion-item">
			<input
				aria-labelledby={ labelId }
				className="domain-picker__suggestion-radio-button"
				type="radio"
				name="domain-picker-suggestion-option"
				onChange={ onDomainSelect }
				checked={ isSelected }
			/>
			<div className="domain-picker__suggestion-item-name" id={ labelId }>
				<span className="domain-picker__domain-name">{ domainName }</span>
				<span className="domain-picker__domain-tld">{ domainTld }</span>
				{ isRecommended && (
					<div className="domain-picker__badge is-recommended">{ __( 'Recommended' ) }</div>
				) }
			</div>
			<div
				className={ classnames( 'domain-picker__price', {
					'is-paid': ! suggestion.is_free,
				} ) }
			>
				{ suggestion.is_free ? (
					__( 'Free' )
				) : (
					<>
						<span className="domain-picker__free-text"> { __( 'Free' ) } </span>
						<span className="domain-picker__price-is-paid">
							{
								/* translators: %s is the price with currency. Eg: $15/year. */
								sprintf( __( '%s/year' ), suggestion.cost )
							}{ ' ' }
						</span>
					</>
				) }
			</div>
		</label>
	);
};

export default DomainPickerSuggestionItem;
