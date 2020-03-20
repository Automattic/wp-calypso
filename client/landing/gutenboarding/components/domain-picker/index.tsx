/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { Button, Panel, PanelBody, PanelRow } from '@wordpress/components';
//  TODO: Extract SearchCard. https://github.com/Automattic/wp-calypso/issues/40323
import SearchCard from 'components/search-card';
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
import DomainPickerSuggestionItem from './suggestion-item';
import DomainPickerSuggestionItemPlaceholder from './suggestion-item-placeholder';

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
	 * Callback that will be invoked when user wants to connect an existing domain.
	 */
	onDomainConnect: () => void;

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
	onDomainConnect,
	onClose,
	queryParameters,
	currentDomain,
} ) => {
	const { __: NO__ } = useI18n();
	const label = NO__( 'Search for a domain' );

	const { siteTitle } = useSelect( select => select( STORE_KEY ).getState() );

	const [ domainSearch, setDomainSearch ] = useState( siteTitle );

	const freePlaceholderAmount = 1;
	const paidPlaceholderAmount = 5;

	const [ search ] = useDebounce( domainSearch.trim() || defaultQuery || '', selectorDebounce );
	const searchOptions = {
		include_wordpressdotcom: true,
		include_dotblogsubdomain: false,
		quantity: 6, // 1 free subdomain, 5 paid domains
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
	const paidSuggestions = allSuggestions?.filter( suggestion => ! suggestion.is_free );

	// Recommend paid domain with exact site title match with highest relevance score.
	const recommendedSuggestion = paidSuggestions?.find( suggestion =>
		suggestion.match_reasons.includes( 'exact-match' )
	);

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
						<SearchCard
							className="domain-picker__search-field"
							inputLabel={ label }
							placeholder={ label }
							onSearch={ setDomainSearch }
							value={ domainSearch }
							compact
							hideClose
							disableAutocorrect
						/>
						<div className="domain-picker__connect-domain">
							<span>{ NO__( 'Already have a domain?' ) }</span>{ ' ' }
							<Button
								className="domain-picker__connect-button"
								isLink
								onClick={ () => onDomainConnect() }
							>
								{ NO__( 'Connect it now' ) }
							</Button>
						</div>
					</div>
				</PanelRow>

				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__suggestion-header">
						<div className="domain-picker__suggestion-header-title">
							{ NO__( 'Professional Domain' ) }
						</div>
						<div className="domain-picker__suggestion-header-description">
							{ __experimentalCreateInterpolateElement(
								NO__( '<Price>Free</Price> for the first year with a paid plan' ),
								{ Price: <em /> }
							) }
						</div>
					</div>
					<div className="domain-picker__suggestion-item-group">
						{ paidSuggestions?.length
							? paidSuggestions.map( suggestion => (
									<DomainPickerSuggestionItem
										suggestion={ suggestion }
										isRecommended={ suggestion === recommendedSuggestion }
										isCurrent={ currentDomain.domain_name === suggestion.domain_name }
										onClick={ () => onDomainPurchase( suggestion ) }
										key={ suggestion.domain_name }
									/>
							  ) )
							: times( paidPlaceholderAmount, i => (
									<DomainPickerSuggestionItemPlaceholder key={ i } />
							  ) ) }
					</div>
				</PanelRow>

				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__suggestion-header">
						<div className="domain-picker__suggestion-header-title">{ NO__( 'Subdomain' ) }</div>
					</div>
					<div className="domain-picker__suggestion-item-group">
						{ freeSuggestions?.length
							? freeSuggestions.map( suggestion => (
									<DomainPickerSuggestionItem
										suggestion={ suggestion }
										isCurrent={ currentDomain.domain_name === suggestion.domain_name }
										onClick={ () => onDomainSelect( suggestion ) }
										key={ suggestion.domain_name }
									/>
							  ) )
							: times( freePlaceholderAmount, i => (
									<DomainPickerSuggestionItemPlaceholder key={ i } />
							  ) ) }
					</div>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
};

export default DomainPicker;
