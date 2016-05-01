/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:sharing' ),
	find = require( 'lodash/find' );

/**
 * Internal dependencies
 */
var SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' ),
	Main = require( 'components/main' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	utils = require( 'lib/site/utils' ),
	sites = require( 'lib/sites-list' )();

import UpgradeNudge from 'my-sites/upgrade-nudge';

module.exports = React.createClass( {
	displayName: 'Sharing',

	componentDidMount: function() {
		debug( 'Sharing React component mounted.' );
	},

	getSelectedText: function() {
		var selected = find( this.getFilters(), { path: this.props.path } );
		if ( selected ) {
			return selected.title;
		}

		return '';
	},

	getFilters: function() {
		var site = sites.getSelectedSite(),
			pathSuffix = sites.selected ? '/' + sites.selected : '',
			filters = [];

		// Include Connections link if all sites are selected. Otherwise,
		// verify that the required Jetpack module is active
		if ( ! site || ! site.jetpack || site.isModuleActive( 'publicize' ) ) {
			filters.push( { title: this.translate( 'Connections' ), path: '/sharing' + pathSuffix, id: 'sharing-connections' } );
		}

		// Include Sharing Buttons link if a site is selected and the
		// required Jetpack module is active
		if ( site && utils.userCan( 'manage_options', site ) &&
			( ! site.jetpack ||
				( site.isModuleActive( 'sharedaddy' ) && site.versionCompare( '3.4-dev', '>=' ) )
			)
		) {
			filters.push( { title: this.translate( 'Sharing Buttons' ), path: '/sharing/buttons' + pathSuffix, id: 'sharing-buttons' } );
		}

		return filters;
	},

	render: function() {
		return (
			<Main className="sharing">
				<SidebarNavigation />
				<SectionNav selectedText={ this.getSelectedText() }>
					<NavTabs>
						{ this.getFilters().map( function( filterItem ) {
							return (
								<NavItem
									key={ filterItem.id }
									path={ filterItem.path }
									selected={ filterItem.path === this.props.path }
								>
									{ filterItem.title }
								</NavItem>
							);
						}, this ) }
					</NavTabs>
				</SectionNav>
				<UpgradeNudge
					title={ this.translate( 'No Ads with WordPress.com Premium' ) }
					message={ this.translate( 'Prevent ads from showing on your site.' ) }
					feature="no-adverts"
					event="sharing_no_ads"
				/>
				{ this.props.contentComponent }
			</Main>
		);
	}
} );
