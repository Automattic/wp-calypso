/**
 * External Dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';

export default React.createClass( {
	displayName: 'SiteSettingsNavigation',

	propTypes: {
		site: React.PropTypes.object.isRequired,
		section: React.PropTypes.string
	},

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
	},

	getImportPath() {
		const { site } = this.props,
			path = '/settings/import';

		if ( site.jetpack ) {
			return `${ site.options.admin_url }import.php`;
		}

		return [ path, site.slug ].join( '/' );
	},

	getExportPath() {
		const { site } = this.props;
		return site.jetpack
			? `${ site.options.admin_url }export.php`
			: `/settings/export/${ site.slug }`;
	},

	render() {
		const { section, site } = this.props;
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
} );
