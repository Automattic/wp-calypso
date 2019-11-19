/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { TextControl, Panel, PanelBody, PanelRow } from '@wordpress/components';
import { __ as NO__ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { DomainSuggestion } from '../../stores/domain-suggestions/types';

interface Props {
	domainSearch: string;
	setDomainSearch: ( domainSearch: string ) => void;
	suggestions: DomainSuggestion[] | undefined;
}

const DomainPicker: FunctionComponent< Props > = ( {
	domainSearch,
	setDomainSearch,
	suggestions,
} ) => {
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
