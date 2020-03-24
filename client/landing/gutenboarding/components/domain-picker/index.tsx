/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { Button, Panel, PanelBody, PanelRow, TextControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useDebounce } from 'use-debounce';
import { times } from 'lodash';
import { useI18n } from '@automattic/react-i18n';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { DomainSuggestions } from '@automattic/data-stores';
import { selectorDebounce } from '../../constants';
import { STORE_KEY } from '../../stores/onboard';
import SuggestionItem from './suggestion-item';
import SuggestionNone from './suggestion-none';
import SuggestionItemPlaceholder from './suggestion-item-placeholder';

/**
 * Style dependencies
 */
import './style.scss';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

const DOMAIN_SUGGESTIONS_STORE = DomainSuggestions.register();

export interface Props {
	/**
	 * Term to search when no user input is provided.
	 */
	defaultQuery?: string;

	/**
	 * Callback that will be invoked when a domain is selected.
	 *
	 * @param domainSuggestion The selected domain.
	 */
	onDomainSelect: ( domainSuggestion: DomainSuggestion ) => void;

	/**
	 * Callback that will be invoked when a paid domain is selected.
	 *
	 * @param domainSuggestion The selected domain.
	 */
	onDomainPurchase: ( domainSuggestion: DomainSuggestion ) => void;

	/**
	 * Callback that will be invoked when a close button is clicked
	 */
	onClose: () => void;

	/**
	 * Additional parameters for the domain suggestions query.
	 */
	queryParameters?: Partial< DomainSuggestions.DomainSuggestionQuery >;

	currentDomain?: DomainSuggestion;
}

const DomainPicker: FunctionComponent< Props > = ( {
	defaultQuery,
	onDomainSelect,
	onDomainPurchase,
	onClose,
	queryParameters,
	currentDomain,
} ) => {
	const PAID_DOMAINS_TO_SHOW = 5;
	const { __: NO__ } = useI18n();
	const label = NO__( 'Search for a domain' );

	const { siteTitle } = useSelect( select => select( STORE_KEY ).getState() );

	const [ domainSearch, setDomainSearch ] = useState( siteTitle );

	const [ search ] = useDebounce( domainSearch.trim() || defaultQuery || '', selectorDebounce );
	const searchOptions = {
		include_wordpressdotcom: true,
		include_dotblogsubdomain: false,
		quantity: PAID_DOMAINS_TO_SHOW + 1, // Add our free subdomain
		...queryParameters,
	};

	const allSuggestions = useSelect(
		select => {
			if ( search ) {
				return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( search, searchOptions );
			}
		},
		[ search, queryParameters ]
	);

	const freeSuggestions = allSuggestions?.filter( suggestion => suggestion.is_free );
	const paidSuggestions = allSuggestions
		?.filter( suggestion => ! suggestion.is_free )
		.slice( 0, PAID_DOMAINS_TO_SHOW );

	// Recommend either an exact match or the highest relevance score
	const recommendedSuggestion = paidSuggestions?.reduce( ( result, suggestion ) => {
		if ( result.match_reasons?.includes( 'exact-match' ) ) {
			return result;
		}
		if ( suggestion.match_reasons?.includes( 'exact-match' ) ) {
			return suggestion;
		}
		if ( suggestion.relevance > result.relevance ) {
			return suggestion;
		}
		return result;
	} );

	return (
		<Panel className="domain-picker">
			<PanelBody>
				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__header">
						<div className="domain-picker__header-title">{ NO__( 'Choose a new domain' ) }</div>
						<Button className="domain-picker__close-button" isTertiary onClick={ () => onClose() }>
							{ NO__( 'Skip for now' ) }
						</Button>
					</div>
					<div className="domain-picker__search">
						<TextControl
							hideLabelFromVision
							label={ label }
							placeholder={ label }
							onChange={ setDomainSearch }
							value={ domainSearch }
						/>
					</div>
				</PanelRow>

				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__suggestion-header">
						<div className="domain-picker__suggestion-header-title">
							{ NO__( 'Professional domain' ) }
						</div>
						<div className="domain-picker__suggestion-header-description">
							{ __experimentalCreateInterpolateElement(
								NO__( '<Price>Free</Price> for the first year with a paid plan' ),
								{ Price: <em /> }
							) }
						</div>
					</div>
					<div className="domain-picker__suggestion-item-group">
						{ ! paidSuggestions &&
							times( PAID_DOMAINS_TO_SHOW, i => <SuggestionItemPlaceholder key={ i } /> ) }
						{ paidSuggestions &&
							( paidSuggestions?.length ? (
								paidSuggestions.map( suggestion => (
									<SuggestionItem
										suggestion={ suggestion }
										isRecommended={ suggestion === recommendedSuggestion }
										isCurrent={ currentDomain?.domain_name === suggestion.domain_name }
										onClick={ () => onDomainPurchase( suggestion ) }
										key={ suggestion.domain_name }
									/>
								) )
							) : (
								<SuggestionNone />
							) ) }
					</div>
				</PanelRow>

				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__suggestion-header">
						<div className="domain-picker__suggestion-header-title">{ NO__( 'Subdomain' ) }</div>
					</div>
					<div className="domain-picker__suggestion-item-group">
						{ ! freeSuggestions && <SuggestionItemPlaceholder /> }
						{ freeSuggestions &&
							( freeSuggestions.length ? (
								<SuggestionItem
									suggestion={ freeSuggestions[ 0 ] }
									isCurrent={ currentDomain?.domain_name === freeSuggestions[ 0 ].domain_name }
									onClick={ () => onDomainSelect( freeSuggestions[ 0 ] ) }
								/>
							) : (
								<SuggestionNone />
							) ) }
					</div>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
};

export default DomainPicker;
