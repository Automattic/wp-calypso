/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useI18n } from '@automattic/react-i18n';
import classnames from 'classnames';
import { sprintf } from '@wordpress/i18n';
import { v4 as uuid } from 'uuid';
import { recordTrainTracksRender, recordTrainTracksInteract } from '@automattic/calypso-analytics';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

interface Props {
	suggestion: DomainSuggestion;
	isRecommended?: boolean;
	isSelected?: boolean;
	categorySlug?: string;
	onSelect: ( domainSuggestion: DomainSuggestion ) => void;
	railcarId: string | undefined;
	uiPosition: number;
	domainSearch: string;
	analyticsFlowId: string;
	domainSuggestionVendor: string;
}

const DomainPickerSuggestionItem: FunctionComponent< Props > = ( {
	suggestion,
	isRecommended = false,
	isSelected = false,
	categorySlug = null,
	onSelect,
	railcarId,
	uiPosition,
	domainSearch,
	analyticsFlowId,
	domainSuggestionVendor,
} ) => {
	const { __ } = useI18n();

	const domain = suggestion.domain_name;
	const dotPos = domain.indexOf( '.' );
	const domainName = domain.slice( 0, dotPos );
	const domainTld = domain.slice( dotPos );

	const fetchAlgo = `/domains/search/${ domainSuggestionVendor }/${ analyticsFlowId }${
		categorySlug ? '/' + categorySlug : ''
	}`;
	const [ previousDomain, setPreviousDomain ] = useState< string | undefined >();
	const [ previousRailcarId, setPreviousRailcarId ] = useState< string | undefined >();

	const labelId = uuid();

	useEffect( () => {
		// Only record TrainTracks render event when the domain name and railcarId change.
		// This effectively records the render event only once for each set of search results.
		if ( domain !== previousDomain && previousRailcarId !== railcarId && railcarId ) {
			recordTrainTracksRender( {
				uiAlgo: `/${ analyticsFlowId }/domain-popover`,
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
		analyticsFlowId,
	] );

	const onDomainSelect = () => {
		// Use previousRailcarId to make sure the select action matches the last rendered railcarId.
		if ( previousRailcarId ) {
			recordTrainTracksInteract( {
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
