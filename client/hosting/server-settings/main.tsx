import config from '@automattic/calypso-config';
import {
	FEATURE_SFTP,
	FEATURE_SFTP_DATABASE,
	WPCOM_FEATURES_ATOMIC,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React, { Fragment, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import QuerySites from 'calypso/components/data/query-sites';
import FeatureExample from 'calypso/components/feature-example';
import Main from 'calypso/components/main';
import { MasonryGrid } from 'calypso/components/masonry-grid';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { ScrollToAnchorOnMount } from 'calypso/components/scroll-to-anchor-on-mount';
import CacheCard from 'calypso/hosting/server-settings/components/cache-card';
import DefensiveModeCard from 'calypso/hosting/server-settings/components/defensive-mode-card';
import { HostingUpsellNudge } from 'calypso/hosting/server-settings/components/hosting-upsell-nudge';
import PhpMyAdminCard from 'calypso/hosting/server-settings/components/phpmyadmin-card';
import RestorePlanSoftwareCard from 'calypso/hosting/server-settings/components/restore-plan-software-card';
import SFTPCard from 'calypso/hosting/server-settings/components/sftp-card';
import WebServerSettingsCard from 'calypso/hosting/server-settings/components/web-server-settings-card';
import HostingActivateStatus from 'calypso/hosting/server-settings/hosting-activate-status';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { TrialAcknowledgeModal } from 'calypso/my-sites/plans/trials/trial-acknowledge/acknowlege-modal';
import { WithOnclickTrialRequest } from 'calypso/my-sites/plans/trials/trial-acknowledge/with-onclick-trial-request';
import TrialBanner from 'calypso/my-sites/plans/trials/trial-banner';
import SiteAdminInterface from 'calypso/my-sites/site-settings/site-admin-interface';
import { useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { getAtomicHostingIsLoadingSftpData } from 'calypso/state/selectors/get-atomic-hosting-is-loading-sftp-data';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { isSiteOnBusinessTrial, isSiteOnECommerceTrial } from 'calypso/state/sites/plans/selectors';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import {
	getSelectedSite,
	getSelectedSiteId,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

import './style.scss';

const HEADING_OFFSET = 30;

type CardEntry = {
	feature: string;
	content: React.ReactElement;
	type: 'basic' | 'advanced';
};

type ShowEnabledFeatureCardsProps = {
	availableTypes: CardEntry[ 'type' ][];
	cards: CardEntry[];
	showDisabledCards?: boolean;
};

const ShowEnabledFeatureCards = ( {
	availableTypes,
	cards,
	showDisabledCards = true,
}: ShowEnabledFeatureCardsProps ) => {
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

type AllCardsProps = {
	isAdvancedHostingDisabled?: boolean;
	isBasicHostingDisabled?: boolean;
	isBusinessTrial?: boolean;
	siteId: number | null;
	siteSlug: string | null;
};

const AllCards = ( {
	isAdvancedHostingDisabled,
	isBasicHostingDisabled,
	siteId,
	siteSlug,
}: AllCardsProps ) => {
	const allCards: CardEntry[] = [
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
			feature: 'restore-plan-software',
			content: <RestorePlanSoftwareCard />,
			type: 'basic',
		},
		{
			feature: 'cache',
			content: <CacheCard disabled={ isBasicHostingDisabled } />,
			type: 'basic',
		},
	];

	if ( siteId ) {
		allCards.push( {
			feature: 'wp-admin',
			content: <SiteAdminInterface siteId={ siteId } siteSlug={ siteSlug } isHosting />,
			type: 'basic',
		} );
	}

	if ( config.isEnabled( 'hosting-server-settings-enhancements' ) ) {
		allCards.push( {
			feature: 'defensive-mode',
			content: <DefensiveModeCard disabled={ isAdvancedHostingDisabled } />,
			type: 'advanced',
		} );
	}

	allCards.push( {
		feature: 'web-server-settings',
		content: <WebServerSettingsCard disabled={ isAdvancedHostingDisabled } />,
		type: 'advanced',
	} );

	const availableTypes: CardEntry[ 'type' ][] = [];

	if ( ! isAdvancedHostingDisabled ) {
		availableTypes.push( 'advanced' );
	}
	if ( ! isBasicHostingDisabled ) {
		availableTypes.push( 'basic' );
	}

	return <ShowEnabledFeatureCards cards={ allCards } availableTypes={ availableTypes } />;
};

type ServerSettingsProps = {
	fetchUpdatedData: () => void;
};

const ServerSettings = ( { fetchUpdatedData }: ServerSettingsProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const clickActivate = () =>
		dispatch( recordTracksEvent( 'calypso_hosting_configuration_activate_click' ) );

	const siteId = useSelector( getSelectedSiteId );
	const hasAtomicFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC )
	);
	const hasSftpFeature = useSelector( ( state ) => siteHasFeature( state, siteId, FEATURE_SFTP ) );
	const site = useSelector( getSelectedSite );
	const isEligibleForHostingTrial =
		useSelector( isUserEligibleForFreeHostingTrial ) && site && site.plan?.is_free;
	const isSiteAtomic = useSelector( ( state ) => isSiteWpcomAtomic( state, siteId ) );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isECommerceTrial = useSelector( ( state ) => isSiteOnECommerceTrial( state, siteId ) );
	const isBusinessTrial = useSelector( ( state ) => isSiteOnBusinessTrial( state, siteId ) );
	const transferState = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const isLoadingSftpData = useSelector( ( state ) =>
		getAtomicHostingIsLoadingSftpData( state, siteId )
	);
	const siteSlug = useSelector( ( state ) => getSelectedSiteSlug( state ) );
	const isWpcomStagingSite = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );

	const [ isTrialAcknowledgeModalOpen, setIsTrialAcknowledgeModalOpen ] = useState( false );
	const [ hasTransfer, setHasTransferring ] = useState(
		!! transferState &&
			transferState !== transferStates.NONE &&
			transferState !== transferStates.INQUIRING &&
			transferState !== transferStates.ERROR &&
			transferState !== transferStates.COMPLETED &&
			transferState !== transferStates.COMPLETE &&
			transferState !== transferStates.REVERTED
	);

	const canSiteGoAtomic = ! isSiteAtomic && hasSftpFeature;
	const showHostingActivationBanner = canSiteGoAtomic && ! hasTransfer;

	const requestUpdatedSiteData = useCallback(
		( isTransferring?: boolean, wasTransferring?: boolean, isTransferCompleted?: boolean ) => {
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
				{ isJetpack && siteId && <QueryJetpackModules siteId={ siteId } /> }
				<WrapperComponent>
					<MasonryGrid>
						<AllCards
							isAdvancedHostingDisabled={ ! hasSftpFeature || ! isSiteAtomic }
							isBasicHostingDisabled={ ! hasAtomicFeature || ! isSiteAtomic }
							isBusinessTrial={ isBusinessTrial && ! hasTransfer }
							siteId={ siteId }
							siteSlug={ siteSlug }
						/>
					</MasonryGrid>
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
		<Main wideLayout className="page-server-settings">
			{ ! isLoadingSftpData && (
				<ScrollToAnchorOnMount
					offset={ HEADING_OFFSET }
					timeout={ 250 }
					container={
						document.querySelector< HTMLElement >( '.item-preview__content' ) ?? undefined
					}
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
				<TrialAcknowledgeModal
					setOpenModal={ ( isOpen ) => {
						setIsTrialAcknowledgeModalOpen( isOpen );
					} }
					trialRequested={ () => {
						setHasTransferring( true );
					} }
				/>
			) }
			<QueryReaderTeams />
		</Main>
	);
};

export default WithOnclickTrialRequest( ServerSettings );
