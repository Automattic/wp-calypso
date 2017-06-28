/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, siteSupportsJetpackSettingsUi } from 'state/sites/selectors';
import GuidedTransfer from 'my-sites/guided-transfer';
import SiteSettingsNavigation from './navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import JetpackDevModeNotice from './jetpack-dev-mode-notice';

export class SiteSettingsComponent extends Component {

	static propTypes = {
		section: PropTypes.string,
		// Connected props
		siteId: PropTypes.number,
		jetpackSettingsUiSupported: PropTypes.bool
	};

	static defaultProps = {
		section: 'guidedTransfer'
	};

	getSection() {
		const { section, hostSlug } = this.props;

		switch ( section ) {
			case 'guidedTransfer':
				return <GuidedTransfer hostSlug={ hostSlug } />;
		}
	}

	render() {
		const { siteId } = this.props;
		const { jetpackSettingsUiSupported, section } = this.props;

		return (
			<Main className="site-settings">
					{
						jetpackSettingsUiSupported &&
						<JetpackDevModeNotice />
					}
					<SidebarNavigation />
					{ siteId && <SiteSettingsNavigation section={ section } /> }
					<QueryProductsList />
					{ siteId && <QuerySitePurchases siteId={ siteId } /> }
					{ siteId && this.getSection() }
			</Main>
		);
	}

}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const jetpackSite = isJetpackSite( state, siteId );
		const jetpackUiSupported = siteSupportsJetpackSettingsUi( state, siteId );

		return {
			siteId,
			jetpackSettingsUiSupported: jetpackSite && jetpackUiSupported,
		};
	}
)( SiteSettingsComponent );
