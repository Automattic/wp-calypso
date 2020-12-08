/**
 * External dependencies
 */
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import ThreatHistoryList from 'calypso/components/jetpack/threat-history-list';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import canCurrentUser from 'calypso/state/selectors/can-current-user';
import ScanNavigation from '../navigation';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	filter: string;
}

export default function ScanHistoryPage( { filter }: Props ) {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isAdmin = useSelector( ( state ) => canCurrentUser( state, siteId, 'manage_options' ) );
	const isJetpackPlatform = isJetpackCloud();

	return (
		<Main
			className={ classNames( 'scan history', {
				is_jetpackcom: isJetpackPlatform,
			} ) }
		>
			<DocumentHead title={ translate( 'Scan' ) } />
			<SidebarNavigation />
			<PageViewTracker path="/scan/history/:site" title="Scan History" />
			{ ! isJetpackPlatform && (
				<FormattedHeader headerText={ 'Jetpack Scan' } align="left" brandFont />
			) }
			{ ! isAdmin && (
				<EmptyContent
					illustration="/calypso/images/illustrations/illustration-404.svg"
					title={ translate( 'You are not authorized to view this page' ) }
				/>
			) }
			{ isAdmin && (
				<>
					<ScanNavigation section={ 'history' } />
					<section className="history__body">
						<p className="history__description">
							{ translate(
								'The scanning history contains a record of all previously active threats on your site.'
							) }
						</p>
						<ThreatHistoryList filter={ filter } />
					</section>
				</>
			) }
		</Main>
	);
}
