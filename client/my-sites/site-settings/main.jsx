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
import config from 'config';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import notices from 'notices';
import QuerySitePurchases from 'components/data/query-site-purchases';
import { getSitePurchases, hasLoadedSitePurchasesFromServer, getPurchasesError } from 'state/purchases/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import GeneralSettings from './section-general';
import WritingSettings from './form-writing';
import DiscussionSettings from './section-discussion';
import AnalyticsSettings from './section-analytics';
import SeoSettings from './section-seo';
import ImportSettings from './section-import';
import ExportSettings from './section-export';
import GuidedTransfer from 'my-sites/guided-transfer';
import SiteSecurity from './section-security';
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

	getImportPath() {
		const { site } = this.state,
			path = '/settings/import';

		if ( site.jetpack ) {
			return `${ site.options.admin_url }import.php`;
		}

		return [ path, site.slug ].join( '/' );
	}

	getExportPath() {
		const { site } = this.state;
		return site.jetpack
			? `${ site.options.admin_url }export.php`
			: `/settings/export/${ site.slug }`;
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
			case 'seo':
				return <SeoSettings site={ site } />;
			case 'import':
				return <ImportSettings site={ site } />;
			case 'export':
				return <ExportSettings site={ site }/>;
			case 'guidedTransfer':
				return <GuidedTransfer hostSlug={ hostSlug } />;
		}
	}

	renderSectioNav() {
		const { site } = this.state;
		const { section } = this.props;

		const strings = this.getStrings();
		const selectedText = strings[ section ];

		if ( ! site ) {
			return ( <SectionNav /> );
		}

		if ( section === 'guidedTransfer' ) {
			// Dont show the navigation for guided transfer since it includes its own back navigation
			return null;
		}

		return (
			<SectionNav selectedText={ selectedText } >
				<NavTabs>
					<NavItem
						path={ `/settings/general/${ site.slug }` }
						selected={ section === 'general' } >
							{ strings.general }
					</NavItem>

					<NavItem
						path={ `/settings/writing/${ site.slug }` }
						selected={ section === 'writing' } >
							{ strings.writing }
					</NavItem>

					<NavItem
						path={ `/settings/discussion/${ site.slug }` }
						selected={ section === 'discussion' } >
							{ strings.discussion }
					</NavItem>

					{
						! site.jetpack && config.isEnabled( 'manage/plans' ) &&
							<NavItem
								path={ `/settings/analytics/${ site.slug }` }
								selected={ section === 'analytics' } >
									{ strings.analytics }
							</NavItem>
					}

					{ ! site.jetpack && config.isEnabled( 'manage/seo' ) &&
						<NavItem
							path={ `/settings/seo/${ site.slug }` }
							selected={ section === 'seo' } >
								{ strings.seo }
						</NavItem>
					}

					{
						config.isEnabled( 'manage/security' ) && site.jetpack &&
							<NavItem path={ `/settings/security/${ site.slug }` }
							selected={ section === 'security' } >
								{ strings.security }
						</NavItem>
					}

					<NavItem
						path={ this.getImportPath() }
						selected={ section === 'import' }
						isExternalLink={ !! site.jetpack } >
							{ strings.import }
					</NavItem>

					{
						config.isEnabled( 'manage/export' ) &&
							<NavItem
								path={ this.getExportPath() }
								selected={ section === 'export' }
								isExternalLink={ !! site.jetpack } >
									{ strings.export }
							</NavItem>
					}
				</NavTabs>
			</SectionNav>
		);
	}

	render() {
		const { site } = this.state;

		return (
			<section className="site-settings">
				<div className="main main-column" role="main">
					<SidebarNavigation />

					{ this.renderSectioNav( site ) }
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
