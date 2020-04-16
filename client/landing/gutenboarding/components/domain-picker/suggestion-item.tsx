/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useI18n } from '@automattic/react-i18n';
import classnames from 'classnames';
import { useSelect } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

/**
 * Internal dependencies
 */
import { STORE_KEY } from '../../stores/onboard';
import { recordTrainTracksRender, recordTrainTracksInteract } from '../../utils/analytics';
import { DOMAIN_SUGGESTION_VENDOR, FLOW_ID } from '../../constants';

interface Props {
	suggestion: DomainSuggestion;
	isRecommended?: boolean;
	isSelected?: boolean;
	onSelect: ( domainSuggestion: DomainSuggestion ) => void;
	railcarId: string;
	uiPosition: number;
}

const DomainPickerSuggestionItem: FunctionComponent< Props > = ( {
	suggestion,
	isRecommended = false,
	isSelected = false,
	onSelect,
	railcarId,
	uiPosition,
} ) => {
	const { __ } = useI18n();

	const domain = suggestion.domain_name;
	const dotPos = domain.indexOf( '.' );
	const domainName = domain.slice( 0, dotPos );
	const domainTld = domain.slice( dotPos );

	const { domainSearch } = useSelect( select => select( STORE_KEY ).getState() );
	const fetchAlgo = `/domains/search/${ DOMAIN_SUGGESTION_VENDOR }/${ FLOW_ID }`;
	const [ previousDomain, setPreviousDomain ] = useState< string | undefined >();
	const [ previousRailcarId, setPreviousRailcarId ] = useState< string | undefined >();

	useEffect( () => {
		// Only record TrainTracks render event when the domain name changes
		if ( domain !== previousDomain || previousRailcarId !== railcarId ) {
			recordTrainTracksRender( {
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
	] );

	const onDomainSelect = () => {
		recordTrainTracksInteract( { action: 'domain_selected', railcarId } );
		onSelect( suggestion );
	};

	return (
		<label className="domain-picker__suggestion-item">
			<input
				className="domain-picker__suggestion-radio-button"
				type="radio"
				name="domain-picker-suggestion-option"
				onChange={ onDomainSelect }
				checked={ isSelected }
			/>
			<div className="domain-picker__suggestion-item-name">
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
