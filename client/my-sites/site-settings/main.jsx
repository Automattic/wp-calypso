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
import notices from 'notices';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getSitePurchases, hasLoadedSitePurchasesFromServer, getPurchasesError } from 'state/purchases/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import GeneralSettings from './section-general';
import WritingSettings from './form-writing';
import DiscussionSettings from './section-discussion';
import AnalyticsSettings from './section-analytics';
import ImportSettings from './section-import';
import ExportSettings from './section-export';
import GuidedTransfer from 'my-sites/guided-transfer';
import SiteSecurity from './section-security';
import SiteSettingsNavigation from './navigation';
import SidebarNavigation from 'my-sites/sidebar-navigation';

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
			writing: i18n.translate( 'Writing', { context: 'settings screen' } ),
			discussion: i18n.translate( 'Discussion', { context: 'settings screen' } ),
			analytics: i18n.translate( 'Analytics', { context: 'settings screen' } ),
			security: i18n.translate( 'Security', { context: 'settings screen' } ),
			seo: i18n.translate( 'SEO', { context: 'settings screen' } ),
			'import': i18n.translate( 'Import', { context: 'settings screen' } ),
			'export': i18n.translate( 'Export', { context: 'settings screen' } ),
		};
	}

	getSection() {
		const { site } = this.state;
		const { section, hostSlug } = this.props;

		switch ( section ) {
			case 'general':
				return <GeneralSettings site={ site }
					sitePurchases={ this.props.sitePurchases }
					hasLoadedSitePurchasesFromServer={ this.props.hasLoadedSitePurchasesFromServer } />;
			case 'writing':
				return <WritingSettings site={ site } />;
			case 'discussion':
				return <DiscussionSettings site={ site } />;
			case 'security':
				return <SiteSecurity site={ site } />;
			case 'analytics':
				return <AnalyticsSettings site={ site } />;
			case 'import':
				return <ImportSettings site={ site } />;
			case 'export':
				return <ExportSettings site={ site }/>;
			case 'guidedTransfer':
				return <GuidedTransfer hostSlug={ hostSlug } />;
		}
	}

	render() {
		const { site } = this.state;
		const { section } = this.props;

		return (
			<section className="site-settings">
				<div className="main main-column" role="main">
					<SidebarNavigation />
					<SiteSettingsNavigation site={ site } section={ section } />
					{ site && <QuerySitePurchases siteId={ site.ID } /> }
					{ site && this.getSection() }
				</div>
			</section>
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
		return {
			hasLoadedSitePurchasesFromServer: hasLoadedSitePurchasesFromServer( state ),
			purchasesError: getPurchasesError( state ),
			sitePurchases: getSitePurchases( state, getSelectedSiteId( state ) )
		};
	}
)( SiteSettingsComponent );
