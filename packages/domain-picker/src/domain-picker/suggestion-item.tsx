/**
 * External dependencies
 */
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useI18n } from '@automattic/react-i18n';
import classnames from 'classnames';
import { sprintf } from '@wordpress/i18n';
import { v4 as uuid } from 'uuid';
import { recordTrainTracksInteract } from '@automattic/calypso-analytics';
import { Icon, arrowRight } from '@wordpress/icons';

type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

interface Props {
	suggestion: DomainSuggestion;
	railcarId: string | undefined;
	isRecommended?: boolean;
	onRender: () => void;
	onSelect: ( domainSuggestion: DomainSuggestion ) => void;
}

const DomainPickerSuggestionItem: FunctionComponent< Props > = ( {
	suggestion,
	railcarId,
	isRecommended = false,
	onSelect,
	onRender,
} ) => {
	const { __ } = useI18n();

	const domain = suggestion.domain_name;
	const dotPos = domain.indexOf( '.' );
	const domainName = domain.slice( 0, dotPos );
	const domainTld = domain.slice( dotPos );

	const [ previousDomain, setPreviousDomain ] = useState< string | undefined >();
	const [ previousRailcarId, setPreviousRailcarId ] = useState< string | undefined >();

	const labelId = uuid();

	useEffect( () => {
		// Only record TrainTracks render event when the domain name and railcarId change.
		// This effectively records the render event only once for each set of search results.
		if ( domain !== previousDomain && previousRailcarId !== railcarId && railcarId ) {
			onRender();
			setPreviousDomain( domain );
			setPreviousRailcarId( railcarId );
		}
	}, [ domain, previousDomain, previousRailcarId, railcarId, onRender ] );

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
		<button
			type="button"
			className="domain-picker__suggestion-item"
			onClick={ onDomainSelect }
			id={ labelId }
		>
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
						<span className="domain-picker__price-long">
							<span className="domain-picker__price-cost">
								{
									/* translators: %s is the price with currency. Eg: $15/year. */
									sprintf( __( 'Included in paid plan, %s/year' ), suggestion.cost )
								}
							</span>
						</span>
						<span className="domain-picker__price-short">
							<span className="domain-picker__price-cost">
								{
									/* translators: %s is the price with currency. Eg: $15/year. */
									sprintf( __( '%s/year' ), suggestion.cost )
								}
							</span>
						</span>
					</>
				) }
			</div>
			<div className="domain-picker__suggestion-item-select-button">
				<span>{ __( 'Select' ) }</span>
				<Icon icon={ arrowRight } size={ 18 } />
			</div>
		</button>
	);
};

export default DomainPickerSuggestionItem;
