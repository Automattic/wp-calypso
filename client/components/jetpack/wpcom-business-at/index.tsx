/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import PageViewTracker from 'lib/analytics/page-view-tracker';

/**
 * Style dependencies
 */
import './style.scss';

export default function WPCOMBusinessAT() {
	return (
		<Main className="wpcom-business-at">
			<DocumentHead title="Activate Jetpack Backup now" />
			<SidebarNavigation />
			<PageViewTracker path="/backup/:site" title="Business Plan Upsell" />
			<div className="wpcom-business-at__main">Automated transfer to Atomic infrastructure!</div>
		</Main>
	);
}
