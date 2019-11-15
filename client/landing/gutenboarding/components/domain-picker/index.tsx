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

	let search = domainSearch.trim();
	if ( ! search && isFilledFormValue( siteTitle ) ) {
		search = siteTitle;
	}

	const suggestions = useSelect(
		select => {
			if ( search ) {
				return select( DOMAIN_STORE ).getDomainSuggestions( search, {
					include_wordpressdotcom: true,
					...( isFilledFormValue( siteVertical ) && { vertical: siteVertical.id } ),
				} );
			}
		},
		[ search, siteVertical ]
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
				{ suggestions?.length ? (
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
