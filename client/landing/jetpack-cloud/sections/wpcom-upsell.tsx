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

export default function WPCOMUpsell() {
	return (
		<Main className="wpcom-upsell">
			<DocumentHead title="Upgrade to Business" />
			<SidebarNavigation />
			<PageViewTracker path="/scan/:site" title="Business Plan Upsell" />
			<div className="wpcom-upsell__content">Upgrade to business plz!</div>
		</Main>
	);
}
