/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	isWordadsInstantActivationEligible,
	canUpgradeToUseWordAds,
	canAccessEarnSection,
} from 'lib/ads/utils';
import { isPremium, isBusiness, isEcommerce } from 'lib/products-values';
import FeatureExample from 'components/feature-example';
import FormButton from 'components/forms/form-button';
import Card from 'components/card';
import { requestWordAdsApproval, dismissWordAdsError } from 'state/wordads/approve/actions';
import {
	isRequestingWordAdsApprovalForSite,
	getWordAdsErrorForSite,
	getWordAdsSuccessForSite,
} from 'state/wordads/approve/selectors';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import QueryWordadsStatus from 'components/data/query-wordads-status';
import UpgradeNudgeExpanded from 'blocks/upgrade-nudge-expanded';
import { PLAN_PREMIUM, PLAN_JETPACK_PREMIUM, FEATURE_WORDADS_INSTANT } from 'lib/plans/constants';
import canCurrentUser from 'state/selectors/can-current-user';
import { getSiteFragment } from 'lib/route';
import { isSiteWordadsUnsafe } from 'state/wordads/status/selectors';
import { wordadsUnsafeValues } from 'state/wordads/status/schema';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';

/**
 * Style dependencies
 */
import './style.scss';
import 'my-sites/stats/stats-module/style.scss';

class AdsWrapper extends Component {
	static propTypes = {
		adsProgramName: PropTypes.string,
		isUnsafe: PropTypes.oneOf( wordadsUnsafeValues ),
		requestingWordAdsApproval: PropTypes.bool.isRequired,
		requestWordAdsApproval: PropTypes.func.isRequired,
		section: PropTypes.string.isRequired,
		site: PropTypes.object,
		wordAdsError: PropTypes.string,
		wordAdsSuccess: PropTypes.bool,
	};

	componentDidMount() {
		this.redirectToStats();
	}

	componentDidUpdate() {
		this.redirectToStats();
	}

	redirectToStats() {
		const { siteSlug, site } = this.props;
		const siteFragment = getSiteFragment( page.current );

		if ( siteSlug && site && ! canAccessEarnSection( site ) ) {
			page( '/stats/' + siteSlug );
		} else if ( ! siteFragment ) {
			page( '/earn/' );
		}
	}

	handleDismissWordAdsError = () => {
		const { siteId } = this.props;
		this.props.dismissWordAdsError( siteId );
	};

	renderInstantActivationToggle( component ) {
		const { siteId, translate } = this.props;

		return (
			<div>
				<QueryWordadsStatus siteId={ siteId } />
				<Card className="ads__activate-wrapper">
					<div className="ads__activate-header">
						<h2 className="ads__activate-header-title">{ translate( 'WordAds Disabled' ) }</h2>
						<div className="ads__activate-header-toggle">
							<FormButton
								disabled={
									this.props.site.options.wordads ||
									( this.props.requestingWordAdsApproval && this.props.wordAdsError === null ) ||
									this.props.isUnsafe !== false
								}
								onClick={ this.props.requestWordAdsApproval }
							>
								{ translate( 'Join WordAds' ) }
							</FormButton>
						</div>
					</div>
					{ this.props.wordAdsError && (
						<Notice
							classname="ads__activate-notice"
							status="is-error"
							onDismissClick={ this.handleDismissWordAdsError }
						>
							{ this.props.wordAdsError }
						</Notice>
					) }
					{ this.props.isUnsafe === 'mature' && (
						<Notice
							classname="ads__activate-notice"
							status="is-warning"
							showDismiss={ false }
							text={ translate(
								'Your site has been identified as serving mature content. ' +
									'Our advertisers would like to include only family-friendly sites in the program.'
							) }
						>
							<NoticeAction
								href="https://wordads.co/2012/09/06/wordads-is-for-family-safe-sites/"
								external={ true }
							>
								{ translate( 'Learn more' ) }
							</NoticeAction>
						</Notice>
					) }
					{ this.props.isUnsafe === 'spam' && (
						<Notice
							classname="ads__activate-notice"
							status="is-warning"
							showDismiss={ false }
							text={ translate(
								'Your site has been identified as serving automatically created or copied content. ' +
									'We cannot serve WordAds on these kind of sites.'
							) }
						/>
					) }
					{ this.props.isUnsafe === 'private' && (
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
					) }
					{ this.props.isUnsafe === 'other' && (
						<Notice
							classname="ads__activate-notice"
							status="is-warning"
							showDismiss={ false }
							text={ translate( 'Your site cannot participate in WordAds program.' ) }
						/>
					) }
					<p className="ads__activate-description">
						{ translate(
							'WordAds allows you to make money from advertising that runs on your site. ' +
								'Because you have a WordPress.com %(plan)s plan, you can skip the review process and activate WordAds instantly. ' +
								'{{a}}Learn more about the program.{{/a}}',
							{
								args: { plan: this.props.site.plan.product_name_short },
								components: {
									a: <a href={ 'http://wordads.co' } />,
								},
							}
						) }
					</p>
				</Card>
				<FeatureExample>{ component }</FeatureExample>
			</div>
		);
	}

	renderUpsell() {
		const { translate } = this.props;
		return (
			<UpgradeNudgeExpanded
				plan={ PLAN_PREMIUM }
				title={ translate( 'Upgrade to the Premium plan and start earning' ) }
				subtitle={ translate(
					"By upgrading to the Premium plan, you'll be able to monetize your site through the WordAds program."
				) }
				highlightedFeature={ FEATURE_WORDADS_INSTANT }
				benefits={ [
					translate( 'Instantly enroll into the WordAds network.' ),
					translate( 'Earn money from your content and traffic.' ),
				] }
			/>
		);
	}

	renderjetpackUpsell() {
		const { translate } = this.props;
		return (
			<UpgradeNudgeExpanded
				plan={ PLAN_JETPACK_PREMIUM }
				title={ translate( 'Upgrade to the Premium plan and start earning' ) }
				subtitle={ translate(
					"By upgrading to the Premium plan, you'll be able to monetize your site through the Jetpack Ads program."
				) }
				highlightedFeature={ FEATURE_WORDADS_INSTANT }
				benefits={ [
					translate( 'Instantly enroll into the Jetpack Ads network.' ),
					translate( 'Earn money from your content and traffic.' ),
				] }
			/>
		);
	}

	render() {
		const { site, translate } = this.props;
		const jetpackPremium =
			site.jetpack &&
			( isPremium( site.plan ) || isBusiness( site.plan ) || isEcommerce( site.plan ) );

		if ( ! canAccessEarnSection( site ) ) {
			return null;
		}

		let component = this.props.children;
		let notice = null;

		if ( this.props.requestingWordAdsApproval || this.props.wordAdsSuccess ) {
			notice = (
				<Notice status="is-success" showDismiss={ false }>
					{ translate( 'You have joined the WordAds program. Please review these settings:' ) }
				</Notice>
			);
		} else if ( ! site.options.wordads && isWordadsInstantActivationEligible( site ) ) {
			component = this.renderInstantActivationToggle( component );
		} else if ( canUpgradeToUseWordAds( site ) && site.jetpack && ! jetpackPremium ) {
			component = this.renderjetpackUpsell();
		} else if ( canUpgradeToUseWordAds( site ) ) {
			component = this.renderUpsell();
		} else if ( ! ( site.options.wordads || jetpackPremium ) ) {
			component = null;
		}

		return (
			<div>
				{ notice }
				{ component }
			</div>
		);
	}
}

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	return {
		site,
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		canManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
		requestingWordAdsApproval: isRequestingWordAdsApprovalForSite( state, site ),
		wordAdsError: getWordAdsErrorForSite( state, site ),
		wordAdsSuccess: getWordAdsSuccessForSite( state, site ),
		isUnsafe: isSiteWordadsUnsafe( state, siteId ),
		adsProgramName: isJetpackSite( state, siteId ) ? 'Ads' : 'WordAds',
	};
};

const mapDispatchToProps = {
	requestWordAdsApproval,
	dismissWordAdsError,
};

const mergeProps = ( stateProps, dispatchProps, parentProps ) => ( {
	...dispatchProps,
	requestWordAdsApproval: () =>
		! stateProps.requestingWordAdsApproval
			? dispatchProps.requestWordAdsApproval( stateProps.siteId )
			: null,
	...parentProps,
	...stateProps,
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( AdsWrapper ) );
