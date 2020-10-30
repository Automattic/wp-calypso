/**
 * External dependencies
 */
import { Title } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { TextControl, SVG, Path } from '@wordpress/components';
import * as React from 'react';
import DomainPicker from '@automattic/domain-picker';
import { useSite, useDomainSearch } from '../hooks';
import { Icon, check } from '@wordpress/icons';

import './styles.scss';

const bulb = (
	<SVG viewBox="0 0 24 24">
		<Path d="M12 15.8c-3.7 0-6.8-3-6.8-6.8s3-6.8 6.8-6.8c3.7 0 6.8 3 6.8 6.8s-3.1 6.8-6.8 6.8zm0-12C9.1 3.8 6.8 6.1 6.8 9s2.4 5.2 5.2 5.2c2.9 0 5.2-2.4 5.2-5.2S14.9 3.8 12 3.8zM8 17.5h8V19H8zM10 20.5h4V22h-4z" />
	</SVG>
);

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
				<Title>{ __( "You're almost there", __i18n_text_domain__ ) }</Title>
				<p className="focused-launch__caption">
					{ __(
						'Prepare for launch! Confirm a few final things before you take it live.',
						__i18n_text_domain__
					) }
				</p>
			</div>

			<div className="focused-launch__step">
				<div className="focused-launch__data-input">
					<div className="focused-launch__section">
						<TextControl
							className="focused-launch__input"
							label={
								<label className="focused-launch__label">
									{ __( '1. Name your site', __i18n_text_domain__ ) }
								</label>
							}
							value={ siteTitle }
							onChange={ ( value ) => setSiteTitle( value ) }
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus={ true }
						/>
					</div>
				</div>
				<div className="focused-launch__side-commentary"></div>
			</div>

			<div className="focused-launch__step">
				<div className="focused-launch__data-input">
					<div className="focused-launch__section">
						<DomainPicker
							header={
								<>
									<label className="focused-launch__label">
										{ __( '2. Confirm your domain', 'launch' ) }
									</label>
									<p className="focused-launch__mobile-commentary focused-launch__mobile-only">
										<Icon icon={ bulb } /> 46.9% of globally registered domains are .com
									</p>
								</>
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
							quantity={ 3 }
						/>
					</div>
				</div>
				<div className="focused-launch__side-commentary">
					<p className="focused-launch__side-commentary-title">
						<strong>46.9%</strong> of globally registered domains are <strong>.com</strong>
					</p>
					<ul className="focused-launch__side-commentary-list">
						<li className="focused-launch__side-commentary-list-item">
							<Icon icon={ check } /> Stand out with a unique domain
						</li>
						<li className="focused-launch__side-commentary-list-item">
							<Icon icon={ check } /> Easy to remember and easy to share
						</li>
						<li className="focused-launch__side-commentary-list-item">
							<Icon icon={ check } /> Builds brand recognition and trust
						</li>
					</ul>
				</div>
			</div>
			<div className="focused-launch__step">
				<div className="focused-launch__data-input">
					<div className="focused-launch__section">
						<label className="focused-launch__label">
							{ __( '3. Confirm your plan', 'launch' ) }
						</label>
						<p className="focused-launch__mobile-commentary focused-launch__mobile-only">
							<Icon icon={ bulb } /> Monetize your site with <strong>WordPress Premium</strong>
						</p>
					</div>
				</div>
				<div className="focused-launch__side-commentary">
					<p className="focused-launch__side-commentary-title">
						Monetize your site with <strong>WordPress Premium</strong>
					</p>
					<ul className="focused-launch__side-commentary-list">
						<li className="focused-launch__side-commentary-list-item">
							<Icon icon={ check } /> Advanced tools and customization
						</li>
						<li className="focused-launch__side-commentary-list-item">
							<Icon icon={ check } /> Unlimited premium themes
						</li>
						<li className="focused-launch__side-commentary-list-item">
							<Icon icon={ check } /> Accept payments
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default FocusedLaunch;
