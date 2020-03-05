/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import {
	Button,
	HorizontalRule,
	Panel,
	PanelBody,
	PanelRow,
	TextControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useDebounce } from 'use-debounce';
import { times } from 'lodash';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { DomainSuggestions } from '@automattic/data-stores';
import { selectorDebounce } from '../../constants';
/**
 * Style dependencies
 */
import './style.scss';

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
	onDomainSelect: ( domainSuggestion: DomainSuggestions.DomainSuggestion ) => void;

	/**
	 * Callback that will be invoked when a paid domain is selected.
	 *
	 * @param domainSuggestion The selected domain.
	 */
	onDomainPurchase: ( domainSuggestion: DomainSuggestions.DomainSuggestion ) => void;

	/**
	 * Additional parameters for the domain suggestions query.
	 */
	queryParameters?: Partial< DomainSuggestions.DomainSuggestionQuery >;
}

const DomainPicker: FunctionComponent< Props > = ( {
	defaultQuery,
	onDomainSelect,
	onDomainPurchase,
	queryParameters,
	currentDomain,
} ) => {
	const { __: NO__ } = useI18n();
	const label = NO__( 'Search for a domain' );

	const [ domainSearch, setDomainSearch ] = useState( '' );

	const placeholderAmount = 5;

	const [ search ] = useDebounce( domainSearch.trim() || defaultQuery || '', selectorDebounce );
	const searchOptions = {
		include_wordpressdotcom: true,
		include_dotblogsubdomain: true,
		quantity: 15,
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

	let numberOfFreeDomains = 0;
	let numberOfPaidDomains = 0;
	const suggestions = allSuggestions?.filter( suggestion => {
		if (
			suggestion.cost === 'Free' &&
			! numberOfFreeDomains &&
			suggestion.domain_name !== currentDomain.domain_name
		) {
			numberOfFreeDomains++;
			return suggestion;
		}
		if ( suggestion.cost !== 'Free' && numberOfPaidDomains < 5 ) {
			numberOfPaidDomains++;
			return suggestion;
		}
	} );

	const handleDomainClick = suggestion => {
		if ( suggestion.is_free ) {
			onDomainSelect( suggestion );
		} else {
			onDomainPurchase( suggestion );
		}
	};

	return (
		<Panel className="domain-picker">
			<PanelBody>
				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__choose-domain-header">
						{ NO__( 'Choose a new domain' ) }
					</div>
					<TextControl
						hideLabelFromVision
						label={ label }
						placeholder={ label }
						onChange={ setDomainSearch }
						value={ domainSearch }
					/>
				</PanelRow>

				<HorizontalRule className="domain-picker__divider" />

				<PanelRow className="domain-picker__panel-row">
					<div className="domain-picker__recommended-header">{ NO__( 'Recommended' ) }</div>
					{ suggestions?.length
						? suggestions.map( suggestion => (
								<Button
									onClick={ () => handleDomainClick( suggestion ) }
									className="domain-picker__suggestion-item"
									key={ suggestion.domain_name }
								>
									<span className="domain-picker__suggestion-item-name">
										{ suggestion.domain_name }
									</span>
									<span className="domain-picker__suggestion-action">
										{ suggestion.is_free ? (
											<span>
												<span className="domain-picker__price">{ NO__( 'Free' ) }</span>
												{ NO__( 'Select' ) }
											</span>
										) : (
											<span>
												<span className="domain-picker__price">{ NO__( 'from €4/month' ) }</span>
												{ NO__( 'Upgrade' ) }
											</span>
										) }
									</span>
								</Button>
						  ) )
						: times( placeholderAmount, i => (
								<Button className="domain-picker__suggestion-item" key={ i }>
									<span className="domain-picker__suggestion-item-name placeholder">
										example.wordpress.com
									</span>
									<span className="domain-picker__suggestion-action placeholder">
										{ NO__( 'Select' ) }
									</span>
								</Button>
						  ) ) }
				</PanelRow>
			</PanelBody>
		</Panel>
	);
};

export default DomainPicker;
