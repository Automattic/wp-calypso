/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';
import { TextControl, Panel, PanelBody, PanelRow } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ as NO__ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { STORE_KEY as DOMAIN_STORE } from '../../stores/domain-suggestions';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { isFilledFormValue } from '../../stores/onboard/types';

const DomainPicker: FunctionComponent = () => {
	// User can search for a domain
	const [ domainSearch, setDomainSearch ] = useState( '' );

	// Without user search, we can provide recommendations based on title + vertical
	const { siteTitle, siteVertical } = useSelect( select => select( ONBOARD_STORE ).getState() );

	const suggestions = useSelect(
		select => {
			if ( domainSearch.trim() ) {
				return select( DOMAIN_STORE ).getDomainSuggestions( domainSearch, {
					include_wordpressdotcom: true,
				} );
			} else if ( isFilledFormValue( siteTitle ) ) {
				return select( DOMAIN_STORE ).getDomainSuggestions( siteTitle, {
					include_wordpressdotcom: false,
					...( isFilledFormValue( siteVertical ) && { vertical: siteVertical.id } ),
				} );
			}
		},
		[ domainSearch, siteTitle, siteVertical ]
	);

	const label = NO__( 'Search for a domain' );

	return (
		<Panel className="domain-picker">
			<PanelBody>
				<PanelRow>
					<TextControl
						hideLabelFromVision
						label={ label }
						placeholder={ label }
						onChange={ setDomainSearch }
						value={ domainSearch }
					/>
				</PanelRow>
				{ suggestions?.length /* @TODO: Add optional chain */ ? (
					<PanelRow>
						<ul>
							{ suggestions.map( ( { domain_name } ) => (
								<li key={ domain_name }>{ domain_name }</li>
							) ) }
						</ul>
					</PanelRow>
				) : null }
			</PanelBody>
		</Panel>
	);
};

export default DomainPicker;
