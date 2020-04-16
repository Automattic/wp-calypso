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
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import FormattedHeader from 'components/formatted-header';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isSiteOnAtomicPlan from 'state/selectors/is-site-on-atomic-plan';
import canSiteViewAtomicHosting from 'state/selectors/can-site-view-atomic-hosting';
import SFTPCard from './sftp-card';
import PhpMyAdminCard from './phpmyadmin-card';
import SupportCard from './support-card';
import PhpVersionCard from './php-version-card';
import SiteBackupCard from './site-backup-card';
import MiscellaneousCard from './miscellaneous-card';
import NoticeAction from 'components/notice/notice-action';
import TrackComponentView from 'lib/analytics/track-component-view';
import Notice from 'components/notice';
import UpsellNudge from 'blocks/upsell-nudge';
import { recordTracksEvent } from 'state/analytics/actions';
import {
	getAutomatedTransferStatus,
	isAutomatedTransferActive,
} from 'state/automated-transfer/selectors';
import { transferStates } from 'state/automated-transfer/constants';
import { requestSite } from 'state/sites/actions';
import FeatureExample from 'components/feature-example';
import { PLAN_BUSINESS } from 'lib/plans/constants';

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
				showIcon={ true }
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
					<div className="hosting__layout">
						<div className="hosting__layout-col">
							<SFTPCard disabled={ isDisabled } />
							<PhpMyAdminCard disabled={ isDisabled } />
							<PhpVersionCard disabled={ isDisabled } />
							<MiscellaneousCard disabled={ isDisabled } />
						</div>
						<div className="hosting__layout-col">
							<SiteBackupCard disabled={ isDisabled } />
							<SupportCard />
						</div>
					</div>
				</WrapperComponent>
			);
		};

		return (
			<Main className="hosting is-wide-layout">
				<PageViewTracker path="/hosting-config/:site" title="Hosting Configuration" />
				<DocumentHead title={ translate( 'Hosting Configuration' ) } />
				<SidebarNavigation />
				<FormattedHeader
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
	state => {
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
