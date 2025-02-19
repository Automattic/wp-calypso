import {
	PLAN_PREMIUM,
	PLAN_JETPACK_SECURITY_DAILY,
	WPCOM_FEATURES_WORDADS,
	FEATURE_WORDADS_INSTANT,
	Plan,
	getPlan,
	getPlanFeaturesObject,
} from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import wordAdsImage from 'calypso/assets/images/illustrations/dotcom-wordads.svg';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import ActionCard from 'calypso/components/action-card';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySites from 'calypso/components/data/query-sites';
import QueryWordadsStatus from 'calypso/components/data/query-wordads-status';
import EmptyContent from 'calypso/components/empty-content';
import FeatureExample from 'calypso/components/feature-example';
import FormButton from 'calypso/components/forms/form-button';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { WordAdsStatus } from 'calypso/my-sites/earn/ads/types';
import { buildCheckoutURL } from 'calypso/my-sites/plans/jetpack-plans/get-purchase-url-callback';
import { useDispatch, useSelector } from 'calypso/state';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSiteWordadsStatus from 'calypso/state/selectors/get-site-wordads-status';
import siteHasWordAds from 'calypso/state/selectors/site-has-wordads';
import { canAccessWordAds, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { requestWordAdsApproval, dismissWordAdsError } from 'calypso/state/wordads/approve/actions';
import {
	isRequestingWordAdsApprovalForSite,
	getWordAdsErrorForSite,
	getWordAdsSuccessForSite,
} from 'calypso/state/wordads/approve/selectors';
import { isSiteWordadsUnsafe } from 'calypso/state/wordads/status/selectors';

import './style.scss';
import 'calypso/my-sites/stats/stats-module/style.scss';

type AdsWrapperProps = {
	section?: string;
	children?: ReactNode;
};

const AdsWrapper = ( { section, children }: AdsWrapperProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const site = useSelector( getSelectedSite );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const canAccessAds = useSelector( ( state ) => canAccessWordAds( state, site?.ID ) );
	const wordAdsStatus = useSelector( ( state ) => getSiteWordadsStatus( state, site?.ID ) );
	const hasWordAdsFeature = useSelector( ( state ) => siteHasWordAds( state, site?.ID ?? null ) );
	const wordAdsError = useSelector( ( state ) => getWordAdsErrorForSite( state, site ?? {} ) );
	const wordAdsSuccess = useSelector( ( state ) => getWordAdsSuccessForSite( state, site ?? {} ) );
	const isUnsafe = useSelector( ( state ) => isSiteWordadsUnsafe( state, site?.ID ) );
	const canActivateWordAds = useSelector( ( state ) =>
		canCurrentUser( state, site?.ID, 'activate_wordads' )
	);
	const requestingWordAdsApproval = useSelector( ( state ) =>
		isRequestingWordAdsApprovalForSite( state, site )
	);
	const adsProgramName = useSelector( ( state ) =>
		isJetpackSite( state, site?.ID ) ? 'Ads' : 'WordAds'
	);
	const canActivateWordadsInstant =
		! site?.options?.wordads && canActivateWordAds && hasWordAdsFeature;
	const canUpgradeToUseWordAds = ! site?.options?.wordads && ! hasWordAdsFeature;
	const isWordadsInstantEligibleButNotOwner =
		! site?.options?.wordads && hasWordAdsFeature && ! canActivateWordAds;
	const isEnrolledWithIneligiblePlan =
		site?.options?.wordads && ! hasWordAdsFeature && wordAdsStatus === WordAdsStatus.ineligible;

	const requestAdsApproval = () =>
		! requestingWordAdsApproval ? dispatch( requestWordAdsApproval( site?.ID ) ) : null;

	const handleDismissWordAdsError = () => {
		dispatch( dismissWordAdsError( site?.ID ) );
	};

	const renderInstantActivationToggle = ( component: ReactNode ) => {
		return (
			<div>
				{ wordAdsError && (
					<Notice
						className="ads__activate-notice"
						status="is-error"
						onDismissClick={ handleDismissWordAdsError }
					>
						{ wordAdsError as ReactNode }
					</Notice>
				) }
				{ isUnsafe === 'mature' && (
					<Notice
						className="ads__activate-notice"
						status="is-warning"
						showDismiss={ false }
						text={ translate(
							'Your site has been identified as serving mature content. ' +
								'Our advertisers would like to include only family-friendly sites in the program.'
						) }
					>
						<NoticeAction
							href="https://wordads.co/2012/09/06/wordads-is-for-family-safe-sites/"
							external
						>
							{ translate( 'Learn more' ) }
						</NoticeAction>
					</Notice>
				) }
				{ isUnsafe === 'spam' && (
					<Notice
						className="ads__activate-notice"
						status="is-warning"
						showDismiss={ false }
						text={ translate(
							'Your site has been identified as serving automatically created or copied content. ' +
								'We cannot serve WordAds on these kind of sites.'
						) }
					/>
				) }
				{ isUnsafe === 'private' && (
					<Notice
						className="ads__activate-notice"
						status="is-warning"
						showDismiss={ false }
						text={ translate(
							'Your site is marked as private. It needs to be public so that visitors can see the ads.'
						) }
					>
						<NoticeAction href={ '/settings/general/' + siteSlug }>
							{ translate( 'Change privacy settings' ) }
						</NoticeAction>
					</Notice>
				) }
				{ isUnsafe === 'other' && (
					<Notice
						className="ads__activate-notice"
						status="is-warning"
						showDismiss={ false }
						text={ translate( 'Your site cannot participate in the WordAds program.' ) }
					/>
				) }

				<Card className="ads__activate-wrapper">
					<div className="ads__activate-header">
						<h2 className="ads__activate-header-title">{ translate( 'Apply to Join WordAds' ) }</h2>
						<div className="ads__activate-header-toggle">
							<FormButton
								disabled={
									site?.options?.wordads ||
									( requestingWordAdsApproval && wordAdsError === null ) ||
									isUnsafe !== false
								}
								onClick={ requestAdsApproval }
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
	};

	const renderEmptyContent = () => {
		return (
			<EmptyContent
				illustration="/calypso/images/illustrations/illustration-404.svg"
				title={ translate( 'You are not authorized to view this page' ) }
			/>
		);
	};

	const renderOwnerRequiredMessage = () => {
		return (
			<EmptyContent
				illustration="/calypso/images/illustrations/wordAds.svg"
				illustrationWidth={ 400 }
				title={ translate( 'Only site owners are eligible to activate WordAds.' ) }
			/>
		);
	};

	const renderUpsell = () => {
		const bannerURL = buildCheckoutURL( siteSlug as string, PLAN_PREMIUM );
		const plan = getPlan( PLAN_PREMIUM ) as Plan;
		const jetpackFeatures = plan?.get2023PricingGridSignupJetpackFeatures?.();
		const jetpackFeaturesObject = getPlanFeaturesObject( jetpackFeatures );

		return (
			<UpsellNudge
				callToAction={ translate( 'Upgrade' ) }
				plan={ PLAN_PREMIUM }
				title={ translate( 'Upgrade to the %(premiumPlanName)s plan and start earning', {
					args: { premiumPlanName: getPlan( PLAN_PREMIUM )?.getTitle() || '' },
				} ) }
				description={ translate(
					"By upgrading to the %(premiumPlanName)s plan, you'll be able to monetize your site through the <a href='%(url)s'>WordAds program</>.",
					{
						args: {
							url: 'https://wordads.co/',
							premiumPlanName: getPlan( PLAN_PREMIUM )?.getTitle() || '',
						},
					}
				) }
				feature={ WPCOM_FEATURES_WORDADS }
				href={ bannerURL }
				showIcon
				event="calypso_upgrade_nudge_impression"
				tracksImpressionName="calypso_upgrade_nudge_impression"
				tracksImpressionProperties={ { cta_name: undefined, cta_size: 'regular' } }
				tracksClickName="calypso_upgrade_nudge_cta_click"
				tracksClickProperties={ { cta_name: undefined, cta_size: 'regular' } }
				list={ [
					translate( 'Instantly enroll into the WordAds network.' ),
					translate( 'Earn money from your content and traffic.' ),
					...jetpackFeaturesObject.map( ( feature ) => feature.getTitle() ),
				] }
			/>
		);
	};

	const renderjetpackUpsell = () => {
		const bannerURL = `/checkout/${ siteSlug }/${ PLAN_JETPACK_SECURITY_DAILY }`;
		return (
			<UpsellNudge
				callToAction={ translate( 'Upgrade' ) }
				plan={ PLAN_JETPACK_SECURITY_DAILY }
				title={ translate( 'Upgrade and start earning' ) }
				description={ translate(
					'Make money each time someone visits your site by displaying ads on all your posts and pages.'
				) }
				href={ bannerURL }
				feature={ WPCOM_FEATURES_WORDADS }
				showIcon
				event="calypso_upgrade_nudge_impression"
				tracksImpressionName="calypso_upgrade_nudge_impression"
				tracksClickName="calypso_upgrade_nudge_click"
			/>
		);
	};

	const renderNoticeSiteIsPrivate = () => {
		const privacySettingPageLink = `https://wordpress.com/settings/general/${ siteSlug }#site-privacy-settings`;
		return (
			<Notice status="is-warning" showDismiss={ false }>
				{ translate(
					"No ads are displayed on your site because your site's {{link}}privacy setting{{/link}} is set to private.",
					{
						components: {
							link: <a href={ privacySettingPageLink } />,
						},
					}
				) }
			</Notice>
		);
	};

	const renderContentWithUpsell = ( component: ReactNode ) => {
		const allowedSections = [ 'ads-earnings', 'ads-payments' ];
		const isAllowedSection = section && allowedSections.includes( section );
		const url = `/plans/${ siteSlug }?feature=${ FEATURE_WORDADS_INSTANT }&plan=${ PLAN_PREMIUM }`;
		return (
			<>
				<UpsellNudge
					forceDisplay
					callToAction={ translate( 'Upgrade' ) }
					plan={ PLAN_PREMIUM }
					title={ translate( 'Upgrade to the %(premiumPlanName)s plan to continue earning', {
						args: { premiumPlanName: getPlan( PLAN_PREMIUM )?.getTitle() || '' },
					} ) }
					description={ translate(
						'WordAds is disabled for this site because it does not have an eligible plan. You are no longer earning ad revenue, but you can view your earning and payment history. To restore access to WordAds please upgrade to an eligible plan.'
					) }
					feature={ WPCOM_FEATURES_WORDADS }
					href={ url }
					showIcon
					event="calypso_upgrade_nudge_impression"
					tracksImpressionName="calypso_upgrade_nudge_impression"
					tracksImpressionProperties={ { cta_name: undefined, cta_size: 'regular' } }
					tracksClickName="calypso_upgrade_nudge_cta_click"
					tracksClickProperties={ { cta_name: undefined, cta_size: 'regular' } }
				/>
				{ isAllowedSection ? component : <FeatureExample>{ component }</FeatureExample> }
			</>
		);
	};

	const getComponentAndNotice = () => {
		let component = children;
		let notice = null;

		if ( requestingWordAdsApproval || wordAdsSuccess ) {
			notice = (
				<Notice status="is-success" showDismiss={ false }>
					{ translate( 'You have joined the WordAds program. Please review these settings:' ) }
				</Notice>
			);
		} else if ( canActivateWordadsInstant ) {
			component = renderInstantActivationToggle( component );
		} else if ( isWordadsInstantEligibleButNotOwner ) {
			component = renderOwnerRequiredMessage();
		} else if ( canUpgradeToUseWordAds && site?.jetpack ) {
			component = renderjetpackUpsell();
		} else if ( canUpgradeToUseWordAds ) {
			component = renderUpsell();
		} else if ( ! canAccessAds ) {
			component = renderEmptyContent();
		} else if ( ! site?.options?.wordads && ! ( site?.jetpack && canUpgradeToUseWordAds ) ) {
			component = null;
		} else if ( site.options?.wordads && site.is_private ) {
			notice = renderNoticeSiteIsPrivate();
		} else if ( isEnrolledWithIneligiblePlan ) {
			component = renderContentWithUpsell( component );
		}
		return { component, notice };
	};

	return (
		<div>
			<QuerySites siteId={ site?.ID } />
			<QuerySiteFeatures siteIds={ [ site?.ID ] } />
			<QueryWordadsStatus siteId={ site?.ID } />
			{ getComponentAndNotice().notice }
			{ getComponentAndNotice().component }
		</div>
	);
};

export default AdsWrapper;
