/**
 * External dependencies
 */
import { Title } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { TextControl } from '@wordpress/components';
import * as React from 'react';
import DomainPicker from '@automattic/domain-picker';
import { useSite, useDomainSearch } from '../hooks';

import './styles.scss';

const FocusedLaunch: React.FunctionComponent = () => {
	const { getSite } = useSelect( ( select ) => select( 'core' ) ) as any;
	const title = getSite()?.title;

	const site = useSite();

	const [ siteTitle, setSiteTitle ] = React.useState( title );
	const [ siteDomainName ] = React.useState( site.currentDomainName );
	const domainSearch = useDomainSearch();

	return (
		<>
			<div className="focused-launch-section">
				<Title>{ __( "You're almost there", 'full-site-editing' ) }</Title>
				<p className="focused-launch-caption">
					{ __(
						'Prepare for launch! Confirm a few final things before you take it live.',
						'full-site-editing'
					) }
				</p>
			</div>
			<div className="focused-launch-section">
				<TextControl
					className="focused-launch-input"
					label={ __( '1. Name your site', 'full-site-editing' ) }
					value={ siteTitle }
					onChange={ ( value ) => setSiteTitle( value ) }
				/>
			</div>
			<div className="focused-launch-section">
				<DomainPicker
					header={
						<label className="focused-launch-label">
							{ __( '2. Confirm your domain', 'full-site-editing' ) }
						</label>
					}
					existingSubdomain={ siteDomainName }
					currentDomain={ siteDomainName }
					onDomainSelect={ setSiteTitle }
					initialDomainSearch={ domainSearch }
					showSearchField={ false }
					analyticsFlowId="focused-launch"
					analyticsUiAlgo="focused_launch_domain_picker"
					onDomainSearchBlur={ () => console.log( 'TODO: on domain search blur' ) }
					onSetDomainSearch={ () => console.log( 'TODO: on set domain search' ) }
				/>
			</div>
			<div className="focused-launch-section">
				<label className="focused-launch-label">
					{ __( '3. Confirm your plan', 'full-site-editing' ) }
				</label>
			</div>
		</>
	);
};

export default FocusedLaunch;
