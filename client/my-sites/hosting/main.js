import { isEnabled } from '@automattic/calypso-config';
import {
	FEATURE_SFTP,
	FEATURE_SFTP_DATABASE,
	FEATURE_SITE_STAGING_SITES,
} from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections';
import QueryKeyringServices from 'calypso/components/data/query-keyring-services';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import FeatureExample from 'calypso/components/feature-example';
import FormattedHeader from 'calypso/components/formatted-header';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { ScrollToAnchorOnMount } from 'calypso/components/scroll-to-anchor-on-mount';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { GitHubCard } from 'calypso/my-sites/hosting/github';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getAutomatedTransferStatus,
	isAutomatedTransferActive,
} from 'calypso/state/automated-transfer/selectors';
import { getAtomicHostingIsLoadingSftpData } from 'calypso/state/selectors/get-atomic-hosting-is-loading-sftp-data';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { requestSite } from 'calypso/state/sites/actions';
import { isSiteOnECommerceTrial } from 'calypso/state/sites/plans/selectors';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import CacheCard from './cache-card';
import { HostingUpsellNudge } from './hosting-upsell-nudge';
import PhpMyAdminCard from './phpmyadmin-card';
import RestorePlanSoftwareCard from './restore-plan-software-card';
import SFTPCard from './sftp-card';
import SiteBackupCard from './site-backup-card';
import StagingSiteCard from './staging-site-card';
import StagingSiteProductionCard from './staging-site-card/staging-site-production-card';
import SupportCard from './support-card';
import WebServerSettingsCard from './web-server-settings-card';
import './style.scss';

const HEADING_OFFSET = 30;

const Hosting = ( props ) => {
	const [ hasClickedOutside, setHasClickedOutside ] = useState( false );

	const {
		teams,
		clickActivate,
		hasSftpFeature,
		isDisabled,
		isECommerceTrial,
		isWpcomStagingSite,
		isTransferring,
		siteId,
		siteSlug,
		translate,
		transferState,
		isLoadingSftpData,
		hasStagingSitesFeature,
	} = props;

	useEffect( () => {
		function onClickOutside( event ) {
			event.preventDefault();
			event.stopImmediatePropagation();
			setHasClickedOutside( true );
			window.removeEventListener( 'click', onClickOutside );
		}

		if ( ! hasClickedOutside && isTransferring && transferStates.COMPLETE !== transferState ) {
			window.addEventListener( 'click', onClickOutside );
			return () => {
				window.removeEventListener( 'click', onClickOutside );
			};
		}
	}, [ hasClickedOutside, isTransferring, transferState ] );

	const getUpgradeBanner = () => {
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
		const { COMPLETE, FAILURE, RELOCATING_REVERT } = transferStates;

		if ( transferState === RELOCATING_REVERT ) {
			return null;
		}

		// Transfer in progress
		if (
			( isTransferring && COMPLETE !== transferState ) ||
			( isDisabled && COMPLETE === transferState )
		) {
			let activationText = translate( 'Please wait while we activate the hosting features.' );
			if ( hasClickedOutside ) {
				activationText = translate( "Don't leave quite yet! Just a bit longer." );
			}

			return (
				<>
					<Notice
						className="hosting__activating-notice"
						status="is-info"
						showDismiss={ false }
						text={ activationText }
						icon="sync"
					/>
				</>
			);
		}

		const failureNotice = FAILURE === transferState && (
			<Notice
				status="is-error"
				showDismiss={ false }
				text={ translate( 'There was an error activating hosting features.' ) }
				icon="bug"
			/>
		);

		if ( isDisabled && ! isTransferring ) {
			return (
				<>
					{ failureNotice }
					<Notice
						status="is-info"
						showDismiss={ false }
						text={ translate(
							'Please activate the hosting access to begin using these features.'
						) }
						icon="globe"
					>
						<TrackComponentView eventName="calypso_hosting_configuration_activate_impression" />
						<NoticeAction
							onClick={ clickActivate }
							href={ `/hosting-config/activate/${ siteSlug }` }
						>
							{ translate( 'Activate' ) }
						</NoticeAction>
					</Notice>
				</>
			);
		}
	};

	const getContent = () => {
		const isGithubIntegrationEnabled =
			isEnabled( 'github-integration-i1' ) && isAutomatticTeamMember( teams );
		const WrapperComponent = isDisabled || isTransferring ? FeatureExample : Fragment;

		return (
			<>
				{ isGithubIntegrationEnabled && (
					<>
						<QueryKeyringServices />
						<QueryKeyringConnections />
					</>
				) }
				<WrapperComponent>
					<Layout className="hosting__layout">
						<Column type="main" className="hosting__main-layout-col">
							<SFTPCard disabled={ isDisabled } />
							<PhpMyAdminCard disabled={ isDisabled } />
							{ ! isWpcomStagingSite && hasStagingSitesFeature && (
								<StagingSiteCard disabled={ isDisabled } />
							) }
							{ isWpcomStagingSite && siteId && (
								<StagingSiteProductionCard siteId={ siteId } disabled={ isDisabled } />
							) }
							{ isGithubIntegrationEnabled && <GitHubCard /> }
							<WebServerSettingsCard disabled={ isDisabled } />
							<RestorePlanSoftwareCard disabled={ isDisabled } />
							<CacheCard disabled={ isDisabled } />
						</Column>
						<Column type="sidebar">
							<SiteBackupCard disabled={ isDisabled } />
							<SupportCard />
						</Column>
					</Layout>
				</WrapperComponent>
			</>
		);
	};

	return (
		<Main wideLayout className="hosting">
			{ ! isLoadingSftpData && <ScrollToAnchorOnMount offset={ HEADING_OFFSET } /> }
			<PageViewTracker path="/hosting-config/:site" title="Hosting Configuration" />
			<DocumentHead title={ translate( 'Hosting Configuration' ) } />
			<FormattedHeader
				brandFont
				headerText={ translate( 'Hosting Configuration' ) }
				subHeaderText={ translate( 'Access your website’s database and more advanced settings.' ) }
				align="left"
			/>
			{ hasSftpFeature ? getAtomicActivationNotice() : getUpgradeBanner() }
			{ getContent() }
			<QueryReaderTeams />
		</Main>
	);
};

export const clickActivate = () =>
	recordTracksEvent( 'calypso_hosting_configuration_activate_click' );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const hasSftpFeature = siteHasFeature( state, siteId, FEATURE_SFTP );
		const hasStagingSitesFeature = siteHasFeature( state, siteId, FEATURE_SITE_STAGING_SITES );

		return {
			teams: getReaderTeams( state ),
			isECommerceTrial: isSiteOnECommerceTrial( state, siteId ),
			transferState: getAutomatedTransferStatus( state, siteId ),
			isTransferring: isAutomatedTransferActive( state, siteId ),
			isDisabled: ! hasSftpFeature || ! isSiteAutomatedTransfer( state, siteId ),
			isLoadingSftpData: getAtomicHostingIsLoadingSftpData( state, siteId ),
			hasSftpFeature,
			siteSlug: getSelectedSiteSlug( state ),
			siteId,
			isWpcomStagingSite: isSiteWpcomStaging( state, siteId ),
			hasStagingSitesFeature,
		};
	},
	{
		clickActivate,
		fetchAutomatedTransferStatus,
		requestSiteById: requestSite,
	}
)( localize( Hosting ) );
