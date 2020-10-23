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

function noop( ...args: unknown[] ) {
	return args;
}

const FocusedLaunch: React.FunctionComponent = () => {
	const { getSite } = useSelect( ( select ) => select( 'core' ) ) as any;
	const title = getSite()?.title;

	const site = useSite();

	const [ siteTitle, setSiteTitle ] = React.useState( title );
	const [ siteDomainName ] = React.useState( site.currentDomainName );
	const domainSearch = useDomainSearch();

	return (
		<div className="focused-launch__container">
			<div className="focused-launch__section">
				<Title>{ __( "You're almost there", 'launch' ) }</Title>
				<p className="focused-launch__caption">
					{ __(
						'Prepare for launch! Confirm a few final things before you take it live.',
						'launch'
					) }
				</p>
			</div>
			<div className="focused-launch__step">
				<div className="focused-launch__data-input">
					<div className="focused-launch__section">
						<TextControl
							className="focused-launch__input"
							label={ __( '1. Name your site', 'launch' ) }
							value={ siteTitle }
							onChange={ ( value ) => setSiteTitle( value ) }
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus={ true }
						/>
					</div>
					<div className="focused-launch__section">
						<DomainPicker
							header={
								<label className="focused-launch__label">
									{ __( '2. Confirm your domain', 'launch' ) }
								</label>
							}
							existingSubdomain={ siteDomainName }
							currentDomain={ siteDomainName }
							onDomainSelect={ setSiteTitle }
							initialDomainSearch={ domainSearch }
							showSearchField={ false }
							analyticsFlowId="focused-launch"
							analyticsUiAlgo="focused_launch_domain_picker"
							onDomainSearchBlur={ () => noop( 'TODO: on domain search blur' ) }
							onSetDomainSearch={ () => noop( 'TODO: on set domain search' ) }
						/>
					</div>
				</div>
				<div className="focused-launch__commentary">
					<div>
						<strong>46.9%</strong> of globally registered domains are <strong>.com</strong>
					</div>
				</div>
			</div>
			<div className="focused-launch__step">
				<div className="focused-launch__data-input">
					<label className="focused-launch__label">
						{ __( '3. Confirm your plan', 'launch' ) }
					</label>
				</div>
				<div className="focused-launch__commentary">
					<div>
						<strong>Some</strong> other interesting info
					</div>
				</div>
			</div>
		</div>
	);
};

export default FocusedLaunch;
