/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	isWordadsInstantActivationEligible,
	//	canUpgradeToUseWordAds,
	canAccessAds,
} from 'lib/ads/utils';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { isPremium, isBusiness, isEcommerce } from 'lib/products-values';
//import Card from 'components/card';
import ActionCard from 'components/action-card';
import Banner from 'components/banner';
import EmptyContent from 'components/empty-content';
import UpgradeNudgeExpanded from 'blocks/upgrade-nudge-expanded';
//import FormButton from 'components/forms/form-button';
//import FeatureExample from 'components/feature-example';
import canCurrentUser from 'state/selectors/can-current-user';
import {
	isRequestingWordAdsApprovalForSite,
	getWordAdsErrorForSite,
	getWordAdsSuccessForSite,
} from 'state/wordads/approve/selectors';
import { isSiteWordadsUnsafe } from 'state/wordads/status/selectors';
import { wordadsUnsafeValues } from 'state/wordads/status/schema';

//import InfiniteScroll from 'components/infinite-scroll';
//import QueryMembershipsEarnings from 'components/data/query-memberships-earnings';
//import QueryMembershipsSettings from 'components/data/query-memberships-settings';
//import { requestSubscribers } from 'state/memberships/subscribers/actions';

//import { decodeEntities } from 'lib/formatting';
//import Gravatar from 'components/gravatar';
//import Button from 'components/button';
//import StripeConnectButton from 'components/stripe-connect-button';
import isSiteOnPaidPlan from 'state/selectors/is-site-on-paid-plan';
//import UpgradeNudge from 'blocks/upgrade-nudge';
import { PLAN_PREMIUM, PLAN_JETPACK_PREMIUM, FEATURE_WORDADS_INSTANT } from 'lib/plans/constants';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
//import SectionHeader from 'components/section-header';
//import QueryMembershipProducts from 'components/data/query-memberships';
//import CompactCard from 'components/card/compact';
//import Gridicon from 'components/gridicon';
import { userCan } from 'lib/site/utils';
//import EllipsisMenu from 'components/ellipsis-menu';
//import PopoverMenuItem from 'components/popover/menu-item';

/**
 * Style dependencies
 */
import './style.scss';

class AdsSection extends Component {
	static propTypes = {
		adsProgramName: PropTypes.string,
		isUnsafe: PropTypes.oneOf( wordadsUnsafeValues ),
		requestingWordAdsApproval: PropTypes.bool.isRequired,
		//		requestWordAdsApproval: PropTypes.func.isRequired,
		section: PropTypes.string.isRequired,
		site: PropTypes.object,
		wordAdsError: PropTypes.string,
		wordAdsSuccess: PropTypes.bool,
	};

	handleDismissWordAdsError = () => {
		const { siteId } = this.props;
		this.props.dismissWordAdsError( siteId );
	};

	constructor( props ) {
		super( props );
	}

	//	componentDidMount() {}
	//	componentDidUpdate() {}

	renderBannerWelcome() {
		return (
			<ActionCard
				headerText={ 'Start Earning Income from Your Site' }
				mainText={
					'WordAds is the leading advertising optimization platform for WordPress sites, where the internet’s top ad suppliers bid against each other to deliver their ads to your site, maximizing your revenue.'
				}
				buttonText={ 'Learn More on WordAds.co' }
				buttonIcon="external"
				buttonPrimary={ false }
				buttonHref="https://wordads.co"
				buttonTarget="_blank"
			>
				<img
					src="/calypso/images/illustrations/dotcom-wordads.svg"
					width="170"
					height="143"
					alt="WordPress logo"
				/>
			</ActionCard>
		);
	}

	renderBannerApplicationReview() {
		return (
			<ActionCard
				headerText={ "We're currently reviewing your application..." }
				mainText={
					"Our ads engineers are hard at work validating your site's content and traffic for advertisers. We'll be in touch shortly."
				}
			>
				<img
					src="/calypso/images/illustrations/waitTime.svg"
					width="170"
					height="143"
					alt="WordPress logo"
				/>
			</ActionCard>
		);
	}

	renderBannerApplicationApprove() {
		return (
			<ActionCard
				headerText={ 'Welcome to WordAds!' }
				mainText={
					'We’ll work behind the scenes to maximize your earning potential and monitor ad quality. On your end, the more you grow your audience and increase your pageviews, the more you can expect to earn.'
				}
			>
				<img
					src="/calypso/images/illustrations/wordAds.svg"
					width="170"
					height="143"
					alt="WordPress logo"
				/>
			</ActionCard>
		);
	}

	renderBannerApplicationDenyBrandSafety() {
		return (
			<ActionCard
				headerText={ "Your content isn't a good fit for ads." }
				mainText={
					"Our advertisers have strict requirements for the type of content they're willing to monetize."
				}
			>
				<img
					src="/calypso/images/illustrations/security-issue.svg"
					width="170"
					height="143"
					alt="WordPress logo"
				/>
			</ActionCard>
		);
	}

	renderBannerApplicationDenyTraffic() {
		return (
			<Fragment>
				<ActionCard
					headerText={ 'You need more traffic to join WordAds.' }
					mainText={
						"Keep building your audience, and as soon as you have enough traffic, we'll approve your application."
					}
				>
					<img
						src="/calypso/images/illustrations/whoops.svg"
						width="170"
						height="143"
						alt="WordPress logo"
					/>
				</ActionCard>
				<br />

				<Banner
					title="Upgrade to a Premium Plan to bypass traffic restrictions."
					description="Sites with a Premium Plan can run ads, regardless of how much traffic they have."
					callToAction="Upgrade to Premium"
					disableHref
					event="track_event"
					href="https://wordpress.com/"
					icon="star"
					prices={ [ 10.99, 9.99 ] }
				/>
			</Fragment>
		);
	}

	statsNotice() {
		return (
			<ActionCard
				buttonPrimary
				buttonHref="https://wordpress.com"
				headerText="Monitor Your Ads Performance"
				mainText="In the stats section, you can monitor the daily performance of the ads running on your site. After each month is finalized, you'll find a revenue report below (usually around 15 days after the close of the month)."
				buttonText="View Daily Stats"
			/>
		);
	}

	renderUpsell() {
		const { translate, isJetpack, adsProgramName } = this.props;
		return (
			<UpgradeNudgeExpanded
				plan={ isJetpack ? PLAN_JETPACK_PREMIUM : PLAN_PREMIUM }
				title={ translate( 'Upgrade to the Premium plan and start earning' ) }
				subtitle={ translate(
					"By upgrading to the Premium plan, you'll be able to monetize your site through the %(program)s program.",
					{ args: { program: adsProgramName } }
				) }
				highlightedFeature={ FEATURE_WORDADS_INSTANT }
				benefits={ [
					translate( 'Instantly enroll into the %(program)s network.', {
						args: { program: adsProgramName },
					} ),
					translate( 'Earn money from your content and traffic.' ),
				] }
			/>
		);
	}

	renderEmptyContent() {
		return (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-404.svg"
				title={ this.props.translate( 'You are not authorized to view this page' ) }
			/>
		);
	}

	render() {
		const { site, translate, isUnsafe, wordAdsError } = this.props;
		const contentUnsafe = [ 'mature', 'spam', 'other' ].includes( isUnsafe );
		const jetpackPremium =
			site.jetpack &&
			( isPremium( site.plan ) || isBusiness( site.plan ) || isEcommerce( site.plan ) );

		let notice = null;
		let component = this.props.children;

		// No access.
		if ( ! canAccessAds( site ) ) {
			return this.renderEmptyContent();
		}

		// Error for non-admins.
		if ( ! userCan( 'manage_options', this.props.site ) ) {
			return (
				<Notice
					status="is-warning"
					text={ this.props.translate( 'Only site administrators can edit Ads settings.' ) }
					showDismiss={ false }
				/>
			);
		}

		// Has not applied.
		// @TODO do jetpack sites have this option set?
		if ( ! site.options.wordads ) {
			// If site has qualifying plan.
			if ( isWordadsInstantActivationEligible( site ) ) {
				// Application.
				return <div>Application goes here.</div>;
			} else {
				// @TODO do we need this? if ( canUpgradeToUseWordAds( site ) ) {

				return <div>{ this.renderUpsell() }</div>;
			}
		} else {
			// If Error.
			if ( wordAdsError ) {
				return (
					<Notice
						classname="ads__activate-notice"
						status="is-error"
						onDismissClick={ this.handleDismissWordAdsError }
					>
						{ this.props.wordAdsError }
					</Notice>
				);
			}

			// Not safe.
			if ( contentUnsafe ) {
				return this.renderBannerApplicationDenyBrandSafety();
			}

			// If private.
			if ( isUnsafe === 'private' ) {
				return (
					<Notice
						classname="ads__activate-notice"
						status="is-warning"
						showDismiss={ false }
						text={ translate(
							'Your site is marked as private. It needs to be public so that visitors can see the ads.'
						) }
					>
						<NoticeAction href={ '/settings/general/' + this.props.siteSlug }>
							{ translate( 'Change privacy settings' ) }
						</NoticeAction>
					</Notice>
				);
			}

			/*
			if ( 'Application is pending / in review' ) {
				return (
					<div>
						{ this.renderBannerApplicationReview() }
						{
							// @TODO add new application
						}
					</div>
				);
			}

			elseif ( 'application is rejected for traffic too low' ) {
				return (
					<div>
						{ this.renderBannerApplicationDenyTraffic() }
						{
							// @TODO add new application
						}
					</div>
				);
			}
			*/
			return (
				<Fragment>
					{ /* Recently approved. */ }
					{ this.props.wordAdsSuccess && this.renderBannerApplicationApprove() }

					{ /* Regular display for WordAds users. */ }
					{ component }

					{ /* Recently approved. */ }
					{ this.props.wordAdsSuccess && this.statsNotice() }
				</Fragment>
			);
		}
	}
}

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );
	return {
		site,
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		canManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
		requestingWordAdsApproval: isRequestingWordAdsApprovalForSite( state, site ),
		wordAdsError: getWordAdsErrorForSite( state, site ),
		wordAdsSuccess: getWordAdsSuccessForSite( state, site ),
		isUnsafe: isSiteWordadsUnsafe( state, siteId ),
		adsProgramName: isJetpackSite( state, siteId ) ? 'Jetpack Ads' : 'WordAds',
		paidPlan: isSiteOnPaidPlan( state, siteId ),
		isJetpack: isJetpack,
		status: 'new',
	};
};

export default connect( mapStateToProps )( localize( AdsSection ) );
