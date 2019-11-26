/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

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
import QuerySites from 'components/data/query-sites';

/**
 * Style dependencies
 */
import './style.scss';

const Hosting = ( {
	canViewAtomicHosting,
	clickActivate,
	isDisabled,
	isTransferring,
	siteId,
	siteSlug,
	translate,
	transferState,
} ) => {
	if ( ! canViewAtomicHosting ) {
		return null;
	}

	const getContent = () => {
		const { COMPLETE, FAILURE } = transferStates;

		const failureNotice = FAILURE === transferState && (
			<Notice
				status="is-info"
				showDismiss={ false }
				text={ translate( 'There was an error activating hosting features.' ) }
				icon="bug"
			/>
		);

		if ( isDisabled && ! isTransferring ) {
			return (
				<Fragment>
					<QuerySites siteId={ siteId } />
					{ failureNotice }
					<Notice
						status="is-info"
						showDismiss={ false }
						text={ translate(
							'Please activate the hosting access to begin using these features.'
						) }
						icon="globe"
					>
						<TrackComponentView eventName={ 'calypso_hosting_configuration_activate_impression' } />
						<NoticeAction
							onClick={ clickActivate }
							href={ `/hosting-config/activate/${ siteSlug }` }
						>
							{ translate( 'Activate' ) }
						</NoticeAction>
					</Notice>
				</Fragment>
			);
		}

		// Transfer in progress
		if ( isTransferring && COMPLETE !== transferState ) {
			return (
				<Fragment>
					<Notice
						status="is-info"
						showDismiss={ false }
						text={ translate( 'Please wait while we activate the hosting features.' ) }
						icon="sync"
					/>
				</Fragment>
			);
		}

		const sftpPhpMyAdminFeaturesEnabled =
			isEnabled( 'hosting/sftp-phpmyadmin' ) && siteId > 168768859;

		return (
			<Fragment>
				<div className="hosting__layout">
					<div className="hosting__layout-col">
						{ sftpPhpMyAdminFeaturesEnabled && <SFTPCard disabled={ isDisabled } /> }
						{ sftpPhpMyAdminFeaturesEnabled && <PhpMyAdminCard disabled={ isDisabled } /> }
						{ ! isDisabled && <PhpVersionCard /> }
					</div>
					<div className="hosting__layout-col">
						<SupportCard />
					</div>
				</div>
			</Fragment>
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
			{ getContent() }
		</Main>
	);
};

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
	{ clickActivate }
)( localize( Hosting ) );
