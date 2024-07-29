import {
	FEATURE_SFTP,
	FEATURE_SFTP_DATABASE,
	WPCOM_FEATURES_ATOMIC,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Fragment, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import QuerySites from 'calypso/components/data/query-sites';
import FeatureExample from 'calypso/components/feature-example';
import Layout from 'calypso/components/layout';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { ScrollToAnchorOnMount } from 'calypso/components/scroll-to-anchor-on-mount';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import TrialBanner from 'calypso/my-sites/plans/trials/trial-banner';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { getAtomicHostingIsLoadingSftpData } from 'calypso/state/selectors/get-atomic-hosting-is-loading-sftp-data';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { requestSite } from 'calypso/state/sites/actions';
import { isSiteOnBusinessTrial, isSiteOnECommerceTrial } from 'calypso/state/sites/plans/selectors';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import { TrialAcknowledgeModal } from '../plans/trials/trial-acknowledge/acknowlege-modal';
import { WithOnclickTrialRequest } from '../plans/trials/trial-acknowledge/with-onclick-trial-request';
import SiteAdminInterface from '../site-settings/site-admin-interface';
import CacheCard from './cache-card';
import HostingActivateStatus from './hosting-activate-status';
import { HostingUpsellNudge } from './hosting-upsell-nudge';
import PhpMyAdminCard from './phpmyadmin-card';
import RestorePlanSoftwareCard from './restore-plan-software-card';
import SFTPCard from './sftp-card';
import WebServerSettingsCard from './web-server-settings-card';
import './style.scss';

const HEADING_OFFSET = 30;

const ShowEnabledFeatureCards = ( { availableTypes, cards, showDisabledCards = true } ) => {
	const enabledCards = cards.filter(
		( card ) => ! card.type || availableTypes.includes( card.type )
	);
	const disabledCards = cards.filter(
		( card ) => card.type && ! availableTypes.includes( card.type )
	);

	return (
		<>
			{ enabledCards.map( ( card ) => {
				return <Fragment key={ card.feature }>{ card.content }</Fragment>;
			} ) }
			{ showDisabledCards && disabledCards.length > 0 && (
				<FeatureExample>
					{ disabledCards.map( ( card ) => {
						return <Fragment key={ card.feature }>{ card.content }</Fragment>;
					} ) }
				</FeatureExample>
			) }
		</>
	);
};

const AllCards = ( { isAdvancedHostingDisabled, isBasicHostingDisabled, siteId, siteSlug } ) => {
	const allCards = [
		{
			feature: 'sftp',
			content: <SFTPCard disabled={ isAdvancedHostingDisabled } />,
			type: 'advanced',
		},
		{
			feature: 'phpmyadmin',
			content: <PhpMyAdminCard disabled={ isAdvancedHostingDisabled } />,
			type: 'advanced',
		},
		{
			feature: 'web-server-settings',
			content: <WebServerSettingsCard disabled={ isAdvancedHostingDisabled } />,
			type: 'advanced',
		},
		{
			feature: 'restore-plan-software',
			content: <RestorePlanSoftwareCard disabled={ isBasicHostingDisabled } />,
			type: 'basic',
		},
		{
			feature: 'cache',
			content: <CacheCard disabled={ isBasicHostingDisabled } />,
			type: 'basic',
		},
		siteId && {
			feature: 'wp-admin',
			content: <SiteAdminInterface siteId={ siteId } siteSlug={ siteSlug } isHosting />,
			type: 'basic',
		},
	].filter( ( card ) => card !== null );

	const availableTypes = [
		! isAdvancedHostingDisabled ? 'advanced' : null,
		! isBasicHostingDisabled ? 'basic' : null,
	].filter( ( type ) => type !== null );

	return <ShowEnabledFeatureCards cards={ allCards } availableTypes={ availableTypes } />;
};

const Hosting = ( props ) => {
	const {
		clickActivate,
		isECommerceTrial,
		isBusinessTrial,
		isWpcomStagingSite,
		siteId,
		siteSlug,
		translate,
		isLoadingSftpData,
		hasAtomicFeature,
		hasSftpFeature,
		isJetpack,
		isEligibleForHostingTrial,
		fetchUpdatedData,
		isSiteAtomic,
		transferState,
	} = props;

	const [ isTrialAcknowledgeModalOpen, setIsTrialAcknowledgeModalOpen ] = useState( false );
	const [ hasTransfer, setHasTransferring ] = useState(
		transferState &&
			! [
				transferStates.NONE,
				transferStates.INQUIRING,
				transferStates.ERROR,
				transferStates.COMPLETED,
				transferStates.COMPLETE,
				transferStates.REVERTED,
			].includes( transferState )
	);

	const canSiteGoAtomic = ! isSiteAtomic && hasSftpFeature;
	const showHostingActivationBanner = canSiteGoAtomic && ! hasTransfer;

	const setOpenModal = ( isOpen ) => {
		setIsTrialAcknowledgeModalOpen( isOpen );
	};

	const trialRequested = () => {
		setHasTransferring( true );
	};

	const requestUpdatedSiteData = useCallback(
		( isTransferring, wasTransferring, isTransferCompleted ) => {
			if ( isTransferring && ! hasTransfer ) {
				setHasTransferring( true );
			}

			if ( ! isTransferring && wasTransferring && isTransferCompleted ) {
				fetchUpdatedData();
			}
		},
		[ hasTransfer ]
	);

	const getPageTitle = () => {
		return translate( 'Server Settings' );
	};

	const getUpgradeBanner = () => {
		if ( hasTransfer ) {
			return null;
		}
		// The eCommerce Trial requires a different upsell path.
		const targetPlan = ! isECommerceTrial
			? undefined
			: {
					callToAction: translate( 'Upgrade your plan' ),
					feature: FEATURE_SFTP_DATABASE,
					href: `/plans/${ siteSlug }?feature=${ encodeURIComponent( FEATURE_SFTP_DATABASE ) }`,
					title: translate( 'Upgrade your plan to access all hosting features' ),
			  };
		return <HostingUpsellNudge siteId={ siteId } targetPlan={ targetPlan } />;
	};

	const getAtomicActivationNotice = () => {
		if ( showHostingActivationBanner ) {
			return (
				<Notice
					className="hosting__activating-notice"
					status="is-info"
					showDismiss={ false }
					text={ translate( 'Please activate the hosting access to begin using these features.' ) }
					icon="globe"
				>
					<TrackComponentView eventName="calypso_hosting_configuration_activate_impression" />
					<NoticeAction onClick={ clickActivate } href={ `/hosting-config/activate/${ siteSlug }` }>
						{ translate( 'Activate' ) }
					</NoticeAction>
				</Notice>
			);
		}
	};

	const getContent = () => {
		const WrapperComponent = ! isSiteAtomic ? FeatureExample : Fragment;

		return (
			<>
				{ isSiteAtomic && <QuerySites siteId={ siteId } /> }
				{ isJetpack && <QueryJetpackModules siteId={ siteId } /> }
				<WrapperComponent>
					<Layout className="hosting__layout">
						<AllCards
							isAdvancedHostingDisabled={ ! hasSftpFeature || ! isSiteAtomic }
							isBasicHostingDisabled={ ! hasAtomicFeature || ! isSiteAtomic }
							isBusinessTrial={ isBusinessTrial && ! hasTransfer }
							siteId={ siteId }
							siteSlug={ siteSlug }
						/>
					</Layout>
				</WrapperComponent>
			</>
		);
	};

	/* We want to show the upsell banner for the following cases:
	 *  1. The site does not have the Atomic feature.
	 *  2. The site is Atomic, is not transferring, and doesn't have advanced hosting features.
	 * Otherwise, we show the activation notice, which may be empty.
	 */
	const shouldShowUpgradeBanner =
		! hasAtomicFeature || ( ! hasTransfer && ! hasSftpFeature && ! isWpcomStagingSite );
	const banner = shouldShowUpgradeBanner ? getUpgradeBanner() : getAtomicActivationNotice();

	return (
		<Main wideLayout className="hosting hosting--is-two-columns">
			{ ! isLoadingSftpData && (
				<ScrollToAnchorOnMount
					offset={ HEADING_OFFSET }
					timeout={ 250 }
					container={ document.querySelector( '.item-preview__content' ) }
				/>
			) }
			<PageViewTracker path="/hosting-config/:site" title="Hosting" />
			<DocumentHead title={ getPageTitle() } />
			<NavigationHeader
				navigationItems={ [] }
				title={ getPageTitle() }
				subtitle={ translate( 'Access your website’s database and more advanced settings.' ) }
			/>
			{ ! showHostingActivationBanner && ! isTrialAcknowledgeModalOpen && (
				<HostingActivateStatus
					context="hosting"
					onTick={ requestUpdatedSiteData }
					keepAlive={ ! isSiteAtomic && hasTransfer }
				/>
			) }
			{ ! isBusinessTrial && banner }
			{ isBusinessTrial && ( ! hasTransfer || isSiteAtomic ) && (
				<TrialBanner
					callToAction={
						<Button primary href={ `/plans/${ siteSlug }` }>
							{ translate( 'Upgrade plan' ) }
						</Button>
					}
				/>
			) }
			{ getContent() }
			{ isEligibleForHostingTrial && isTrialAcknowledgeModalOpen && (
				<TrialAcknowledgeModal setOpenModal={ setOpenModal } trialRequested={ trialRequested } />
			) }
			<QueryReaderTeams />
		</Main>
	);
};

export const clickActivate = () =>
	recordTracksEvent( 'calypso_hosting_configuration_activate_click' );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const hasAtomicFeature = siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC );
		const hasSftpFeature = siteHasFeature( state, siteId, FEATURE_SFTP );
		const site = getSelectedSite( state );
		const isEligibleForHostingTrial =
			isUserEligibleForFreeHostingTrial( state ) && site && site.plan?.is_free;
		const isSiteAtomic = isSiteWpcomAtomic( state, siteId );

		return {
			teams: getReaderTeams( state ),
			isJetpack: isJetpackSite( state, siteId ),
			isECommerceTrial: isSiteOnECommerceTrial( state, siteId ),
			isBusinessTrial: isSiteOnBusinessTrial( state, siteId ),
			transferState: getAutomatedTransferStatus( state, siteId ),
			hasSftpFeature,
			hasAtomicFeature,
			isLoadingSftpData: getAtomicHostingIsLoadingSftpData( state, siteId ),
			siteSlug: getSelectedSiteSlug( state ),
			siteId,
			isWpcomStagingSite: isSiteWpcomStaging( state, siteId ),
			isEligibleForHostingTrial,
			isSiteAtomic,
		};
	},
	{
		clickActivate,
		fetchAutomatedTransferStatus,
		requestSiteById: requestSite,
	}
)( localize( WithOnclickTrialRequest( Hosting ) ) );
