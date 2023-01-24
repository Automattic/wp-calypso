import { FEATURE_SFTP, FEATURE_SFTP_DATABASE } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { Component, Fragment } from 'react';
import wrapWithClickOutside from 'react-click-outside';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import DocumentHead from 'calypso/components/data/document-head';
import FeatureExample from 'calypso/components/feature-example';
import FormattedHeader from 'calypso/components/formatted-header';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getAutomatedTransferStatus,
	isAutomatedTransferActive,
} from 'calypso/state/automated-transfer/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { requestSite } from 'calypso/state/sites/actions';
import { isSiteOnECommerceTrial } from 'calypso/state/sites/plans/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { HostingUpsellNudge } from './hosting-upsell-nudge';
import MiscellaneousCard from './miscellaneous-card';
import PhpMyAdminCard from './phpmyadmin-card';
import RestorePlanSoftwareCard from './restore-plan-software-card';
import SFTPCard from './sftp-card';
import SiteBackupCard from './site-backup-card';
import SupportCard from './support-card';
import WebServerLogsCard from './web-server-logs-card';
import WebServerSettingsCard from './web-server-settings-card';

import './style.scss';

class Hosting extends Component {
	state = {
		clickOutside: false,
	};

	handleClickOutside( event ) {
		const { COMPLETE } = transferStates;
		const { isTransferring, transferState } = this.props;

		if ( isTransferring && COMPLETE !== transferState ) {
			event.preventDefault();
			event.stopImmediatePropagation();
			this.setState( { clickOutside: true } );
		}
	}

	componentDidMount() {
		const { COMPLETE } = transferStates;
		// Check if a reverted site still has the COMPLETE status
		if ( this.props.transferState === COMPLETE ) {
			// Try to refresh the transfer state
			this.props.fetchAutomatedTransferStatus( this.props.siteId );
		}
	}

	render() {
		const {
			clickActivate,
			hasSftpFeature,
			isDisabled,
			isECommerceTrial,
			isTransferring,
			requestSiteById,
			siteId,
			siteSlug,
			translate,
			transferState,
		} = this.props;

		const getUpgradeBanner = () => {
			//eCommerce Trial requires different wording because Business is not the obvious upgrade path
			if ( isECommerceTrial ) {
				return (
					<UpsellNudge
						title={ translate( 'Upgrade your plan to access all hosting features' ) }
						event="calypso_hosting_configuration_upgrade_click"
						href={ `/plans/${ siteSlug }?feature=${ encodeURIComponent( FEATURE_SFTP_DATABASE ) }` }
						feature={ FEATURE_SFTP_DATABASE }
						showIcon={ true }
					/>
				);
			}

			return <HostingUpsellNudge siteId={ siteId } />;
		};

		const getAtomicActivationNotice = () => {
			const { COMPLETE, FAILURE } = transferStates;

			// Transfer in progress
			if (
				( isTransferring && COMPLETE !== transferState ) ||
				( isDisabled && COMPLETE === transferState )
			) {
				if ( COMPLETE === transferState ) {
					requestSiteById( siteId );
				}

				let activationText = translate( 'Please wait while we activate the hosting features.' );
				if ( this.state.clickOutside ) {
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
			const WrapperComponent = isDisabled || isTransferring ? FeatureExample : Fragment;

			return (
				<WrapperComponent>
					<Layout className="hosting__layout">
						<Column type="main" className="hosting__main-layout-col">
							<SFTPCard disabled={ isDisabled } />
							<PhpMyAdminCard disabled={ isDisabled } />
							<WebServerSettingsCard disabled={ isDisabled } />
							<RestorePlanSoftwareCard disabled={ isDisabled } />
							<MiscellaneousCard disabled={ isDisabled } />
							<WebServerLogsCard disabled={ isDisabled } />
						</Column>
						<Column type="sidebar">
							<SiteBackupCard disabled={ isDisabled } />
							<SupportCard />
						</Column>
					</Layout>
				</WrapperComponent>
			);
		};

		return (
			<Main wideLayout className="hosting">
				<PageViewTracker path="/hosting-config/:site" title="Hosting Configuration" />
				<DocumentHead title={ translate( 'Hosting Configuration' ) } />
				<FormattedHeader
					brandFont
					headerText={ translate( 'Hosting Configuration' ) }
					subHeaderText={ translate(
						'Access your website’s database and more advanced settings.'
					) }
					align="left"
				/>
				{ hasSftpFeature ? getAtomicActivationNotice() : getUpgradeBanner() }
				{ getContent() }
			</Main>
		);
	}
}

export const clickActivate = () =>
	recordTracksEvent( 'calypso_hosting_configuration_activate_click' );

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const hasSftpFeature = siteHasFeature( state, siteId, FEATURE_SFTP );

		return {
			isECommerceTrial: isSiteOnECommerceTrial( state, siteId ),
			transferState: getAutomatedTransferStatus( state, siteId ),
			isTransferring: isAutomatedTransferActive( state, siteId ),
			isDisabled: ! hasSftpFeature || ! isSiteAutomatedTransfer( state, siteId ),
			hasSftpFeature,
			siteSlug: getSelectedSiteSlug( state ),
			siteId,
		};
	},
	{
		clickActivate,
		fetchAutomatedTransferStatus,
		requestSiteById: requestSite,
	}
)( localize( wrapWithClickOutside( Hosting ) ) );
