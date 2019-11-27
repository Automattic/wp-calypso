/**
 * External dependencies
 */
import React, { Component } from 'react';
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
import canSiteViewAtomicHosting from 'state/selectors/can-site-view-atomic-hosting';
import SFTPCard from './sftp-card';
import PhpMyAdminCard from './phpmyadmin-card';
import SupportCard from './support-card';
import PhpVersionCard from './php-version-card';
import { isEnabled } from 'config';
import NoticeAction from 'components/notice/notice-action';
import TrackComponentView from 'lib/analytics/track-component-view';
import Notice from 'components/notice';
import { recordTracksEvent } from 'state/analytics/actions';
import { getAutomatedTransferStatus } from 'state/automated-transfer/selectors';
import isAutomatedTransferActive from 'state/selectors/is-automated-transfer-active';
import { transferStates } from 'state/automated-transfer/constants';
import { requestSite } from 'state/sites/actions';

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

		if ( isTransferring && ! COMPLETE === transferState ) {
			event.preventDefault();
			event.stopImmediatePropagation();
			this.setState( { clickOutside: true } );
		}
	}

	render() {
		const {
			canViewAtomicHosting,
			clickActivate,
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

		const getAtomicActivationNotice = () => {
			const { COMPLETE, FAILURE } = transferStates;

			// Transfer in progress
			if (
				( isTransferring && COMPLETE !== transferState ) ||
				( isDisabled && COMPLETE === transferState && isTransferring )
			) {
				requestSiteById( siteId );

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
			const sftpPhpMyAdminFeaturesEnabled =
				isEnabled( 'hosting/sftp-phpmyadmin' ) && siteId > 168768859;

			return (
				<>
					<div className="hosting__layout">
						<div className="hosting__layout-col">
							{ sftpPhpMyAdminFeaturesEnabled && <SFTPCard disabled={ isDisabled } /> }
							{ sftpPhpMyAdminFeaturesEnabled && <PhpMyAdminCard disabled={ isDisabled } /> }
							{ <PhpVersionCard disabled={ isDisabled } /> }
						</div>
						<div className="hosting__layout-col">
							<SupportCard />
						</div>
					</div>
				</>
			);
		};

		return (
			<Main className="hosting is-wide-layout">
				<PageViewTracker path="/hosting-config/:site" title="Hosting Configuration" />
				<DocumentHead title={ translate( 'Hosting Configuration' ) } />
				<SidebarNavigation />
				<FormattedHeader
					headerText={ translate( 'Hosting Configuration' ) }
					subHeaderText={ translate( 'Access and manage more advanced settings of your website.' ) }
					align="left"
				/>
				{ getAtomicActivationNotice() }
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
