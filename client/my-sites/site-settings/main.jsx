/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import i18n from 'i18n-calypso';

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

/**
 * Module vars
 */
const debug = debugFactory( 'calypso:my-sites:site-settings' );

export class SiteSettingsComponent extends Component {
	constructor( props ) {
		super( props );

		// bound methods
		this.updateSite = this.updateSite.bind( this );

		this.state = {
			site: this.props.sites.getSelectedSite()
		};
	}

	componentWillMount() {
		debug( 'Mounting SiteSettings React component.' );
		this.props.sites.on( 'change', this.updateSite );
	}

	componentWillUnmount() {
		this.props.sites.off( 'change', this.updateSite );
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.purchasesError ) {
			notices.error( nextProps.purchasesError );
		}
	}

	getStrings() {
		return {
			general: i18n.translate( 'General', { context: 'settings screen' } ),
			security: i18n.translate( 'Security', { context: 'settings screen' } ),
			'import': i18n.translate( 'Import', { context: 'settings screen' } ),
			'export': i18n.translate( 'Export', { context: 'settings screen' } ),
		};
	}

	getSection() {
		const { site } = this.state;
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
				return <SiteSecurity site={ site } />;
			case 'import':
				return <ImportSettings />;
			case 'export':
				return <ExportSettings />;
			case 'guidedTransfer':
				return <GuidedTransfer hostSlug={ hostSlug } />;
		}
	}

	render() {
		const { site } = this.state;
		const { jetpackSettingsUiSupported, section } = this.props;

		return (
			<Main className="site-settings">
					{
						jetpackSettingsUiSupported &&
						<JetpackDevModeNotice />
					}
					<SidebarNavigation />
					{ site && <SiteSettingsNavigation site={ site } section={ section } /> }
					<QueryProductsList />
					{ site && <QuerySitePurchases siteId={ site.ID } /> }
					{ site && this.getSection() }
			</Main>
		);
	}

	updateSite() {
		this.setState( { site: this.props.sites.getSelectedSite() } );
	}
}

SiteSettingsComponent.propTypes = {
	hasLoadedSitePurchasesFromServer: PropTypes.bool.isRequired,
	purchasesError: PropTypes.object,
	section: PropTypes.string,
	sitePurchases: PropTypes.array.isRequired,
	sites: PropTypes.object.isRequired
};

SiteSettingsComponent.defaultProps = {
	section: 'general'
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const jetpackSite = isJetpackSite( state, siteId );
		const jetpackUiSupported = siteSupportsJetpackSettingsUi( state, siteId );

		return {
			siteId,
			hasLoadedSitePurchasesFromServer: hasLoadedSitePurchasesFromServer( state ),
			purchasesError: getPurchasesError( state ),
			sitePurchases: getSitePurchases( state, getSelectedSiteId( state ) ),
			jetpackSettingsUiSupported: jetpackSite && jetpackUiSupported,
		};
	}
)( SiteSettingsComponent );
