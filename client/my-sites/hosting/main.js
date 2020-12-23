/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import wrapWithClickOutside from 'react-click-outside';

/**
 * Internal dependencies
 */
import Main from 'calypso/components/main';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteOnAtomicPlan from 'calypso/state/selectors/is-site-on-atomic-plan';
import canSiteViewAtomicHosting from 'calypso/state/selectors/can-site-view-atomic-hosting';
import SFTPCard from './sftp-card';
import PhpMyAdminCard from './phpmyadmin-card';
import SupportCard from './support-card';
import PhpVersionCard from './php-version-card';
import SiteBackupCard from './site-backup-card';
import MiscellaneousCard from './miscellaneous-card';
import NoticeAction from 'calypso/components/notice/notice-action';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import Notice from 'calypso/components/notice';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	getAutomatedTransferStatus,
	isAutomatedTransferActive,
} from 'calypso/state/automated-transfer/selectors';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { requestSite } from 'calypso/state/sites/actions';
import FeatureExample from 'calypso/components/feature-example';
import { PLAN_BUSINESS, FEATURE_SFTP } from 'calypso/lib/plans/constants';

/**
 * Style dependencies
 */
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

	render() {
		const {
			canViewAtomicHosting,
			clickActivate,
			isOnAtomicPlan,
			isDisabled,
			isTransferring,
			requestSiteById,
			siteId,
			siteSlug,
			translate,
			transferState,
		} = this.props;

		if ( ! canViewAtomicHosting ) {
			return null;
		}

		const getUpgradeBanner = () => (
			<UpsellNudge
				title={ translate( 'Upgrade to the Business plan to access all hosting features' ) }
				event="calypso_hosting_configuration_upgrade_click"
				href={ `/checkout/${ siteId }/business` }
				plan={ PLAN_BUSINESS }
				feature={ FEATURE_SFTP }
				showIcon
			/>
		);

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
							<TrackComponentView
								eventName={ 'calypso_hosting_configuration_activate_impression' }
							/>
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
							<PhpVersionCard disabled={ isDisabled } />
							<MiscellaneousCard disabled={ isDisabled } />
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
			<Main className="hosting is-wide-layout">
				<PageViewTracker path="/hosting-config/:site" title="Hosting Configuration" />
				<DocumentHead title={ translate( 'Hosting Configuration' ) } />
				<SidebarNavigation />
				<FormattedHeader
					brandFont
					headerText={ translate( 'Hosting Configuration' ) }
					subHeaderText={ translate(
						'Access your website’s database and more advanced settings.'
					) }
					align="left"
				/>
				{ isOnAtomicPlan ? getAtomicActivationNotice() : getUpgradeBanner() }
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

		return {
			transferState: getAutomatedTransferStatus( state, siteId ),
			isTransferring: isAutomatedTransferActive( state, siteId ),
			isDisabled: ! isSiteAutomatedTransfer( state, siteId ),
			isOnAtomicPlan: isSiteOnAtomicPlan( state, siteId ),
			canViewAtomicHosting: canSiteViewAtomicHosting( state ),
			siteSlug: getSelectedSiteSlug( state ),
			siteId,
		};
	},
	{
		clickActivate,
		requestSiteById: requestSite,
	}
)( localize( wrapWithClickOutside( Hosting ) ) );
