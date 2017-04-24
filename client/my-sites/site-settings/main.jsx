/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import notices from 'notices';
import QueryProductsList from 'components/data/query-products-list';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getSitePurchases, hasLoadedSitePurchasesFromServer, getPurchasesError } from 'state/purchases/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, siteSupportsJetpackSettingsUi } from 'state/sites/selectors';
import GeneralSettings from './section-general';
import ImportSettings from './section-import';
import ExportSettings from './section-export';
import GuidedTransfer from 'my-sites/guided-transfer';
import SiteSecurity from './section-security';
import SiteSettingsNavigation from './navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import JetpackDevModeNotice from './jetpack-dev-mode-notice';

export class SiteSettingsComponent extends Component {

	static propTypes = {
		section: PropTypes.string,
		// Connected props
		sitePurchases: PropTypes.array.isRequired,
		purchasesError: PropTypes.object,
		hasLoadedSitePurchasesFromServer: PropTypes.bool.isRequired,
		siteId: PropTypes.number,
		jetpackSettingsUiSupported: PropTypes.bool
	};

	static defaultProps = {
		section: 'general'
	};

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.purchasesError ) {
			notices.error( nextProps.purchasesError );
		}
	}

	getSection() {
		const { section, hostSlug } = this.props;

		switch ( section ) {
			case 'general':
				return (
					<GeneralSettings
						sitePurchases={ this.props.sitePurchases }
						hasLoadedSitePurchasesFromServer={ this.props.hasLoadedSitePurchasesFromServer }
					/>
				);
			case 'security':
				return <SiteSecurity />;
			case 'import':
				return <ImportSettings />;
			case 'export':
				return <ExportSettings />;
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
			hasLoadedSitePurchasesFromServer: hasLoadedSitePurchasesFromServer( state ),
			purchasesError: getPurchasesError( state ),
			sitePurchases: getSitePurchases( state, siteId ),
			jetpackSettingsUiSupported: jetpackSite && jetpackUiSupported,
		};
	}
)( SiteSettingsComponent );
