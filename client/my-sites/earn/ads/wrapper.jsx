/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	isWordadsInstantActivationEligible,
	canUpgradeToUseWordAds,
	canAccessAds,
} from 'lib/ads/utils';
import { isPremium, isBusiness, isEcommerce } from 'lib/products-values';
import FeatureExample from 'components/feature-example';
import FormButton from 'components/forms/form-button';
import { Card } from '@automattic/components';
import EmptyContent from 'components/empty-content';
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
import { isSiteWordadsUnsafe } from 'state/wordads/status/selectors';
import { wordadsUnsafeValues } from 'state/wordads/status/schema';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import ActionCard from 'components/action-card';

/**
 * Image dependencies
 */
import wordAdsImage from 'assets/images/illustrations/dotcom-wordads.svg';

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

	handleDismissWordAdsError = () => {
		const { siteId } = this.props;
		this.props.dismissWordAdsError( siteId );
	};

	renderInstantActivationToggle( component ) {
		const { siteId, translate, adsProgramName } = this.props;

		return (
			<div>
				<QueryWordadsStatus siteId={ siteId } />

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

				<Card className="ads__activate-wrapper">
					<div className="ads__activate-header">
						<h2 className="ads__activate-header-title">{ translate( 'Apply to Join WordAds' ) }</h2>
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
					<ActionCard
						headerText={ translate( 'Start Earning Income from Your Site' ) }
						mainText={ translate(
							'WordAds is the leading advertising optimization platform for WordPress sites, ' +
								'where the internet’s top ad suppliers bid against each other to deliver their ads to your site, maximizing your revenue.' +
								'{{br/}}{{br/}}{{em}}Because you have a paid plan, you can skip the review process and activate %(program)s instantly.{{/em}}' +
								'{{br/}}{{br/}}{{a}}Learn more about the program{{/a}}',
							{
								args: { program: adsProgramName },
								components: {
									a: <a href="http://wordads.co" target="_blank" rel="noopener noreferrer" />,
									em: <em />,
									br: <br />,
								},
							}
						) }
						buttonText={ translate( 'Learn More on WordAds.co' ) }
						buttonIcon="external"
						buttonPrimary={ false }
						buttonHref="https://wordads.co"
						buttonTarget="_blank"
					>
						<img src={ wordAdsImage } width="170" height="143" alt="WordPress logo" />
					</ActionCard>
				</Card>
				<FeatureExample>{ component }</FeatureExample>
			</div>
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

		let component = this.props.children;
		let notice = null;

		if ( ! canAccessAds( site ) ) {
			component = this.renderEmptyContent();
		} else if ( this.props.requestingWordAdsApproval || this.props.wordAdsSuccess ) {
			notice = (
				<Notice status="is-success" showDismiss={ false }>
					{ translate( 'You have joined the WordAds program. Please review these settings:' ) }
				</Notice>
			);
		} else if ( ! site.options.wordads && isWordadsInstantActivationEligible( site ) ) {
			component = this.renderInstantActivationToggle( component );
		} else if ( ! canAccessAds( site ) ) {
			component = this.renderEmptyContent();
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

const mapStateToProps = ( state ) => {
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

export default connect( mapStateToProps, mapDispatchToProps, mergeProps )( localize( AdsWrapper ) );
