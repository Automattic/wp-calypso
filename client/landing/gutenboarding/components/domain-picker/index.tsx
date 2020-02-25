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
	 * Additional parameters for the domain suggestions query.
	 */
	queryParameters?: Partial< DomainSuggestions.DomainSuggestionQuery >;
}

const DomainPicker: FunctionComponent< Props > = ( {
	defaultQuery,
	onDomainSelect,
	queryParameters,
} ) => {
	const { __: NO__ } = useI18n();
	const label = NO__( 'Search for a domain' );

	const [ domainSearch, setDomainSearch ] = useState( '' );

	const [ search ] = useDebounce( domainSearch.trim() || defaultQuery || '', selectorDebounce );
	const searchOptions = {
		include_wordpressdotcom: true,
		include_dotblogsubdomain: true,
		quantity: 4,
		...queryParameters,
	};

	const suggestions = useSelect(
		select => {
			if ( search ) {
				return select( DOMAIN_SUGGESTIONS_STORE ).getDomainSuggestions( search, searchOptions );
			}
		},
		[ search, queryParameters ]
	);

	const handleHasDomain = () => {
		// eslint-disable-next-line no-console
		console.log( 'Already has a domain.' );
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
									onClick={ () => onDomainSelect( suggestion ) }
									className="domain-picker__suggestion-item"
									key={ suggestion.domain_name }
								>
									<span className="domain-picker__suggestion-item-name">
										{ suggestion.domain_name }
									</span>
									{ suggestion.is_free ? (
										<span className="domain-picker__suggestion-action">{ NO__( 'Select' ) }</span>
									) : (
										<a
											className="domain-picker__suggestion-action"
											href={ `http://wordpress.com/start/domain?new=${ suggestion.domain_name }` }
											target="_blank"
											rel="noopener noreferrer"
										>
											{ NO__( 'Upgrade' ) }
										</a>
									) }
								</Button>
						  ) )
						: times( searchOptions.quantity, i => (
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

				<PanelRow className="domain-picker__has-domain domain-picker__panel-row">
					<Button onClick={ handleHasDomain }>{ NO__( 'I already have a domain' ) }</Button>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
};

export default DomainPicker;
