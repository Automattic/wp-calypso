/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import { Title } from '@automattic/onboarding';
import { __ } from '@wordpress/i18n';
import { TextControl, SVG, Path } from '@wordpress/components';
import React from 'react';
import DomainPicker, { LockedPurchasedItem } from '@automattic/domain-picker';
import { Icon, check } from '@wordpress/icons';
import { Link } from 'react-router-dom';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { Route } from '../route';
import { useTitle, useDomainSearch } from '../../hooks';
import { SITE_STORE } from '../../stores';

import './style.scss';

const bulb = (
	<SVG viewBox="0 0 24 24">
		<Path d="M12 15.8c-3.7 0-6.8-3-6.8-6.8s3-6.8 6.8-6.8c3.7 0 6.8 3 6.8 6.8s-3.1 6.8-6.8 6.8zm0-12C9.1 3.8 6.8 6.1 6.8 9s2.4 5.2 5.2 5.2c2.9 0 5.2-2.4 5.2-5.2S14.9 3.8 12 3.8zM8 17.5h8V19H8zM10 20.5h4V22h-4z" />
	</SVG>
);

function noop( ...args: unknown[] ) {
	return args;
}

interface Props {
	siteId: number;
}

const Summary: React.FunctionComponent< Props > = ( { siteId } ) => {
	const { title, updateTitle, saveTitle } = useTitle( siteId );
	const sitePrimaryDomain = useSelect( ( select ) =>
		select( SITE_STORE ).getPrimarySiteDomain( siteId )
	);
	const siteSubdomain = useSelect( ( select ) => select( SITE_STORE ).getSiteSubdomain( siteId ) );
	const hasPaidDomain = sitePrimaryDomain && ! sitePrimaryDomain?.is_subdomain;

	const domainSearch = useDomainSearch();

	let stepNumber = 1;
	return (
		<div className="focused-launch-summary__container">
			<div className="focused-launch-summary__section">
				<Title>{ __( "You're almost there", __i18n_text_domain__ ) }</Title>
				<p className="focused-launch-summary__caption">
					{ __(
						'Prepare for launch! Confirm a few final things before you take it live.',
						__i18n_text_domain__
					) }
				</p>
			</div>
			<div className="focused-launch-summary__step">
				<div className="focused-launch-summary__data-input">
					<div className="focused-launch-summary__section">
						<TextControl
							className="focused-launch-summary__input"
							label={
								<label className="focused-launch-summary__label">
									{ stepNumber++ }. { __( 'Name your site', __i18n_text_domain__ ) }
								</label>
							}
							value={ title }
							onChange={ updateTitle }
							onBlur={ saveTitle }
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus={ true }
						/>
					</div>
				</div>
				<div className="focused-launch-summary__side-commentary"></div>
			</div>
			<div className="focused-launch-summary__step">
				<div className="focused-launch-summary__data-input">
					<div className="focused-launch-summary__section">
						{ hasPaidDomain ? (
							<>
								<label className="focused-launch-summary__label">
									{ __( 'Your domain', __i18n_text_domain__ ) }
								</label>
								<LockedPurchasedItem domainName={ sitePrimaryDomain?.domain || '' } />
							</>
						) : (
							<DomainPicker
								header={
									<>
										<label className="focused-launch-summary__label">
											{ stepNumber++ }. { __( 'Confirm your domain', __i18n_text_domain__ ) }
										</label>
										<p className="focused-launch-summary__mobile-commentary focused-launch-summary__mobile-only">
											<Icon icon={ bulb } /> 46.9% of globally registered domains are .com
										</p>
									</>
								}
								existingSubdomain={ siteSubdomain?.domain }
								currentDomain={ sitePrimaryDomain?.domain }
								onDomainSelect={ noop }
								initialDomainSearch={ domainSearch }
								showSearchField={ false }
								analyticsFlowId="focused-launch"
								analyticsUiAlgo="focused_launch_domain_picker"
								onDomainSearchBlur={ () => noop( 'TODO: on domain search blur' ) }
								onSetDomainSearch={ () => noop( 'TODO: on set domain search' ) }
								quantity={ 3 }
								quantityExpanded={ 3 }
								itemType="button"
							/>
						) }
					</div>
				</div>
				<div className="focused-launch-summary__side-commentary">
					<p className="focused-launch-summary__side-commentary-title">
						<strong>46.9%</strong> of globally registered domains are <strong>.com</strong>
					</p>
					<ul className="focused-launch-summary__side-commentary-list">
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Stand out with a unique domain
						</li>
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Easy to remember and easy to share
						</li>
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Builds brand recognition and trust
						</li>
					</ul>
				</div>
				<div className="focused-launch-summary__data-input">
					<div className="focused-launch-summary__section">
						{ hasPaidDomain ? (
							<>
								<label className="focused-launch__label">
									{ __( 'Your domain', __i18n_text_domain__ ) }
								</label>
								<LockedPurchasedItem domainName={ sitePrimaryDomain?.domain || '' } />
							</>
						) : (
							<DomainPicker
								header={
									<>
										<label className="focused-launch__label">
											{ stepNumber++ }. { __( 'Confirm your domain', __i18n_text_domain__ ) }
										</label>
										<p className="focused-launch__mobile-commentary focused-launch__mobile-only">
											<Icon icon={ bulb } /> 46.9% of globally registered domains are .com
										</p>
									</>
								}
								existingSubdomain={ siteSubdomain?.domain }
								currentDomain={ sitePrimaryDomain?.domain }
								onDomainSelect={ noop }
								initialDomainSearch={ domainSearch }
								showSearchField={ false }
								analyticsFlowId="focused-launch"
								analyticsUiAlgo="focused_launch_domain_picker"
								onDomainSearchBlur={ () => noop( 'TODO: on domain search blur' ) }
								onSetDomainSearch={ () => noop( 'TODO: on set domain search' ) }
								quantity={ 3 }
								quantityExpanded={ 3 }
								itemType="button"
							/>
						) }
						<Link to={ Route.DomainDetails }>
							{ __( 'View all domains', __i18n_text_domain__ ) }
						</Link>
					</div>
				</div>
				<div className="focused-launch-summary__side-commentary">
					<p className="focused-launch-summary__side-commentary-title">
						<strong>46.9%</strong> of globally registered domains are <strong>.com</strong>
					</p>
					<ul className="focused-launch-summary__side-commentary-list">
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Stand out with a unique domain
						</li>
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Easy to remember and easy to share
						</li>
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Builds brand recognition and trust
						</li>
					</ul>
				</div>
			</div>
			<div className="focused-launch-summary__step">
				<div className="focused-launch-summary__data-input">
					<div className="focused-launch-summary__section">
						<label className="focused-launch-summary__label">
							{ stepNumber++ }. { __( 'Confirm your plan', __i18n_text_domain__ ) }
						</label>
						<p className="focused-launch-summary__mobile-commentary focused-launch-summary__mobile-only">
							<Icon icon={ bulb } /> Monetize your site with <strong>WordPress Premium</strong>
						</p>
						<Link to={ Route.PlanDetails }>{ __( 'View all plans', __i18n_text_domain__ ) }</Link>
					</div>
				</div>
				<div className="focused-launch-summary__side-commentary">
					<p className="focused-launch-summary__side-commentary-title">
						Monetize your site with <strong>WordPress Premium</strong>
					</p>
					<ul className="focused-launch-summary__side-commentary-list">
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Advanced tools and customization
						</li>
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Unlimited premium themes
						</li>
						<li className="focused-launch-summary__side-commentary-list-item">
							<Icon icon={ check } /> Accept payments
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
};

export default Summary;
