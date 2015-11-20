/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings' );

/**
 * Internal dependencies
 */
var config = require( 'config' ),
	SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' ),
	GeneralSettings = require( './section-general' ),
	WritingSettings = require( './section-writing' ),
	DiscussionSettings = require( './section-discussion' ),
	AnalyticsSettings = require( './section-analytics' ),
	ImportSettings = require( './section-import' ),
	ExportSettings = require( './section-export' ),
	SiteSecurity = require( './section-security' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' );

module.exports = React.createClass( {

	displayName: 'SiteSettings',

	getInitialState: function() {
		return { site: this.props.sites.getSelectedSite() };
	},

	componentWillMount: function() {
		debug( 'Mounting SiteSettings React component.' );
		this.props.sites.on( 'change', this._updateSite );
	},

	componentWillUnmount: function() {
		this.props.sites.off( 'change', this._updateSite );
	},

	getImportPath: function() {
		var site = this.state.site,
			path = '/settings/import';

		if ( site.jetpack ) {
			return site.options.admin_url + 'import.php';
		}

		return [ path, site.slug ].join( '/' );
	},

	getExportPath: function() {
		var site = this.state.site;
		return site.jetpack ? site.options.admin_url + 'export.php' : '/settings/export/' + site.slug;
	},

	getStrings: function() {
		return {
			general: this.translate( 'General', { context: 'settings screen' } ),
			writing: this.translate( 'Writing', { context: 'settings screen' } ),
			discussion: this.translate( 'Discussion', { context: 'settings screen' } ),
			analytics: this.translate( 'Analytics', { context: 'settings screen' } ),
			security: this.translate( 'Security', { context: 'settings screen' } ),
			'import': this.translate( 'Import', { context: 'settings screen' } ),
			'export': this.translate( 'Export', { context: 'settings screen' } ),
		};
	},

	getSections: function() {
		var site = this.state.site;
		return {
			general: <GeneralSettings site={ site } />,
			writing: <WritingSettings site={ site } />,
			discussion: <DiscussionSettings site={ site } />,
			security: <SiteSecurity site={ site } />,
			analytics: <AnalyticsSettings site={ site } />,
			'import': <ImportSettings site={ site } />,
			'export': <ExportSettings site={ site } />
		};
	},

	render: function() {
		var site = this.state.site,
			section = this.props.section,
			strings = this.getStrings(),
			selectedText = strings[ section ],
			settingsSection = this.getSections();

		if ( ! site ) {
			return null;
		}

		return (
			<section className="site-settings">
				<div className="main main-column" role="main">
					<SidebarNavigation />
					{ ! this.props.subsection ?
					<SectionNav selectedText={ selectedText }>
						<NavTabs>
							<NavItem path={ '/settings/general/' + site.slug } selected={ section === 'general' }>{ strings.general }</NavItem>
							<NavItem path={ '/settings/writing/' + site.slug } selected={ section === 'writing' } >{ strings.writing }</NavItem>
							<NavItem path={ '/settings/discussion/' + site.slug } selected={ section === 'discussion' } >{ strings.discussion }</NavItem>
							{ ! site.jetpack && config.isEnabled( 'manage/plans' ) ?
								<NavItem path={ '/settings/analytics/' + site.slug } selected={ section === 'analytics' } >{ strings.analytics }</NavItem>
							: null }
							{ ( config.isEnabled( 'manage/security' ) && site.jetpack ) ?
								<NavItem path={ '/settings/security/' + site.slug } selected={ section === 'security' } >{ strings.security }</NavItem>
							: null }
							{ config.isEnabled( 'manage/import' ) ?
								<NavItem path={ this.getImportPath() } selected={ section === 'import' } isExternalLink={ !! site.jetpack } >{ strings.import }</NavItem>
							: null }
							{ config.isEnabled( 'manage/export' ) ?
								<NavItem path={ this.getExportPath() } selected={ section === 'export' } isExternalLink={ !! site.jetpack } >{ strings.export }</NavItem>
							: null }
						</NavTabs>
					</SectionNav>
					: null }
					{ settingsSection[ this.props.section ] }
				</div>
			</section>
		);
	},

	_updateSite: function() {
		this.setState( { site: this.props.sites.getSelectedSite() } );
	}

} );
