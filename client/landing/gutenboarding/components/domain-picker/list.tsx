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
import { __ as NO__ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useDebounce } from 'use-debounce';

/**
 * Internal dependencies
 */
import { DomainSuggestion } from '../../stores/domain-suggestions/types';
import { STORE_KEY as DOMAIN_STORE } from '../../stores/domain-suggestions';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { isFilledFormValue } from '../../stores/onboard/types';
import { selectorDebounce } from '../../constants';

const DomainPicker: FunctionComponent = () => {
	const label = NO__( 'Search for a domain' );

	// User can search for a domain
	const [ domainSearch, setDomainSearch ] = useState( '' );

	// Without user search, we can provide recommendations based on title + vertical
	const { siteTitle, siteVertical } = useSelect( select => select( ONBOARD_STORE ).getState() );

	const [ search ] = useDebounce(
		// Use trimmed domainSearch if non-empty
		domainSearch.trim() ||
			// Otherwise use a filled form value
			( isFilledFormValue( siteTitle ) && siteTitle ) ||
			// Otherwise use empty string
			'',
		selectorDebounce
	);
	const suggestions = useSelect(
		select => {
			if ( search ) {
				return select( DOMAIN_STORE ).getDomainSuggestions( search, {
					include_wordpressdotcom: true,
					quantity: 4,
					...( isFilledFormValue( siteVertical ) ? { vertical: siteVertical.id } : undefined ),
				} );
			}
		},
		[ search, siteVertical ]
	);

	const handleDomainPick = ( suggestion: DomainSuggestion ) => () => {
		if ( suggestion.is_free ) {
			// eslint-disable-next-line no-console
			console.log( 'Picked free domain: %o', suggestion );
		} else {
			// eslint-disable-next-line no-console
			console.log( 'Picked paid domain: %o', suggestion );
		}
	};

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

				{ suggestions?.length ? (
					<PanelRow className="domain-picker__panel-row">
						<div className="domain-picker__recommended-header">{ NO__( 'Recommended' ) }</div>
						{ suggestions.map( suggestion => (
							<Button
								onClick={ handleDomainPick( suggestion ) }
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
						) ) }
					</PanelRow>
				) : null }
				<PanelRow className="domain-picker__has-domain domain-picker__panel-row">
					<Button onClick={ handleHasDomain }>{ NO__( 'I already have a domain' ) }</Button>
				</PanelRow>
			</PanelBody>
		</Panel>
	);
};

export default DomainPicker;
