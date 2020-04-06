/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getDomainManagementUrl } from './utils';
import GoogleAppsDetails from './google-apps-details';
import {
	isGoogleApps,
	isBlogger,
	isPlan,
	isFreePlan,
	isDomainRegistration,
} from 'lib/products-values';
import PurchaseDetail from 'components/purchase-detail';
import { EMAIL_VALIDATION_AND_VERIFICATION, DOMAIN_WAITING } from 'lib/url/support';
import { currentUserHasFlag, getCurrentUser } from 'state/current-user/selectors';
import { NON_PRIMARY_DOMAINS_TO_FREE_USERS } from 'state/current-user/constants';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';

const DomainRegistrationDetails = ( {
	selectedSite,
	domain,
	purchases,
	hasNonPrimaryDomainsFlag,
	onPickPlanUpsellClick,
} ) => {
	const googleAppsWasPurchased = purchases.some( isGoogleApps ),
		domainContactEmailVerified = purchases.some( purchase => purchase.isEmailVerified ),
		hasOtherPrimaryDomain =
			selectedSite.options &&
			selectedSite.options.is_mapped_domain &&
			selectedSite.domain !== domain,
		showPlanUpsell =
			hasNonPrimaryDomainsFlag && isFreePlan( selectedSite.plan ) && ! purchases.some( isPlan ),
		purchasedDomain = purchases.find( isDomainRegistration ).meta,
		isRestrictedToBlogDomains = purchases.some( isBlogger ) || isBlogger( selectedSite.plan );

	return (
		<div>
			<div className="checkout-thank-you__domain-registration-details-compact">
				{ ! domainContactEmailVerified && (
					<PurchaseDetail
						icon={ <img alt="" src="/calypso/images/upgrades/check-emails-desktop.svg" /> }
						title={ i18n.translate( 'Verify your email address' ) }
						description={ i18n.translate(
							'We sent you an email with a request to verify your new domain. Unverified domains may be suspended.'
						) }
						buttonText={ i18n.translate( 'Learn more about verifying your domain' ) }
						href={ EMAIL_VALIDATION_AND_VERIFICATION }
						target="_blank"
						rel="noopener noreferrer"
						requiredText={ i18n.translate( 'Important! Your action is required.' ) }
						isRequired
					/>
				) }

				{ googleAppsWasPurchased && <GoogleAppsDetails isRequired /> }
			</div>

			<PurchaseDetail
				icon={ <img alt="" src="/calypso/images/upgrades/wait-time.svg" /> }
				title={ i18n.translate( 'When will it be ready?', { comment: '"it" refers to a domain' } ) }
				description={ i18n.translate(
					'Your domain should start working immediately, but may be unreliable during the first 30 minutes.'
				) }
				buttonText={ i18n.translate( 'Learn more about your domain' ) }
				href={ DOMAIN_WAITING }
				target="_blank"
				rel="noopener noreferrer"
			/>

			{ ! showPlanUpsell && hasOtherPrimaryDomain && (
				<PurchaseDetail
					icon={
						<img
							alt=""
							src={
								isRestrictedToBlogDomains
									? '/calypso/images/illustrations/custom-domain-blogger.svg'
									: '/calypso/images/upgrades/custom-domain.svg'
							}
						/>
					}
					title={ i18n.translate( 'Your primary domain' ) }
					description={ i18n.translate(
						'Your existing domain, {{em}}%(domain)s{{/em}}, is the domain visitors see when they visit your site. ' +
							'All other custom domains redirect to the primary domain.',
						{
							args: { domain: selectedSite.domain },
							components: { em: <em /> },
						}
					) }
					buttonText={ i18n.translate( 'Change primary domain' ) }
					href={ getDomainManagementUrl( selectedSite, domain ) }
				/>
			) }

			{ showPlanUpsell && (
				<PurchaseDetail
					icon={ <img alt="" src="/calypso/images/upgrades/custom-domain.svg" /> }
					title={ i18n.translate( 'Your primary domain' ) }
					description={
						<div>
							<p>
								{ i18n.translate(
									'Your existing domain, %(primaryDomain)s, is the primary domain visitors ' +
										'see when they visit your site. %(purchasedDomain)s will redirect to %(primaryDomain)s.',
									{
										args: {
											primaryDomain: selectedSite.slug,
											purchasedDomain,
										},
									}
								) }
							</p>

							<p>
								{ i18n.translate(
									'Upgrade to a paid plan to make %(purchasedDomain)s the domain people ' +
										'see when they visit your site.',
									{
										args: {
											purchasedDomain,
										},
									}
								) }
							</p>
						</div>
					}
					buttonText={ i18n.translate( 'Pick a plan' ) }
					href={ `/plans/${ selectedSite.slug }` }
					onClick={ onPickPlanUpsellClick }
				/>
			) }

			{ showPlanUpsell && (
				<TrackComponentView eventName="calypso_non_primary_domain_thank_you_plan_upsell_impression" />
			) }
		</div>
	);
};

DomainRegistrationDetails.propTypes = {
	domain: PropTypes.string.isRequired,
	purchases: PropTypes.array.isRequired,
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
	hasNonPrimaryDomainsFlag: PropTypes.bool,
};

const mapStateToProps = state => {
	return {
		hasNonPrimaryDomainsFlag: getCurrentUser( state )
			? currentUserHasFlag( state, NON_PRIMARY_DOMAINS_TO_FREE_USERS )
			: false,
	};
};

const mapDispatchToProps = dispatch => {
	return {
		onPickPlanUpsellClick: () =>
			dispatch( recordTracksEvent( 'calypso_non_primary_domain_thank_you_plan_upsell_click', {} ) ),
	};
};

export default connect( mapStateToProps, mapDispatchToProps )( DomainRegistrationDetails );
