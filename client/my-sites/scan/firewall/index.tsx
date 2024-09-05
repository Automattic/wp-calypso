import { translate } from 'i18n-calypso';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { Site } from 'calypso/my-sites/scan/firewall/types';
import { IAppState } from 'calypso/state/types';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import ScanNavigation from '../navigation';
import FirewallSettings from './firewall';
import type { TranslateResult } from 'i18n-calypso';

interface Props {
	site: Site | null;
	siteId: number | null;
}

class FirewallPage extends Component< Props > {
	renderHeader( text: TranslateResult ) {
		return <h1 className="scan__header">{ text }</h1>;
	}

	render() {
		const { siteId } = this.props;
		const isJetpackPlatform = isJetpackCloud();

		if ( ! siteId ) {
			return;
		}

		return (
			<Main className="firewall">
				<DocumentHead title="Firewall" />
				{ isJetpackPlatform && <SidebarNavigation /> }
				<PageViewTracker path="/scan/firewall" title="Firewall" />
				{ ! isA8CForAgencies() && (
					<NavigationHeader
						navigationItems={ [] }
						title={ translate( 'Scan' ) }
						subtitle={ translate( 'Guard against malware and bad actors 24/7.' ) }
					/>
				) }
				<ScanNavigation section="firewall" />
				<div className="scan__content">
					<FirewallSettings />
				</div>
			</Main>
		);
	}
}

export default connect( ( state: IAppState ) => {
	const site = getSelectedSite( state ) as Site;
	const siteId = getSelectedSiteId( state );

	if ( ! siteId ) {
		return {
			site,
			siteId,
		};
	}

	return {
		site,
		siteId,
	};
} )( FirewallPage );
