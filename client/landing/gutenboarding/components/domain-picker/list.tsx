/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import {
	Button,
	HorizontalRule,
	Panel,
	PanelBody,
	PanelRow,
	TextControl,
} from '@wordpress/components';
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

	const handleDomainPick = suggestion => () => {
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
