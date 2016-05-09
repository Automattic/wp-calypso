/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:ads-settings' ),
	find = require( 'lodash/find' );

/**
 * Internal dependencies
 */
var SectionNav = require( 'components/section-nav' ),
	NavTabs = require( 'components/section-nav/tabs' ),
	NavItem = require( 'components/section-nav/item' ),
	Main = require( 'components/main' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	AdsEarnings = require( 'my-sites/ads/form-earnings' ),
	AdsSettings = require( 'my-sites/ads/form-settings' ),
	AdsUtils = require( 'lib/ads/utils' ),
	sites = require( 'lib/sites-list' )();

import FeatureExample from 'components/feature-example';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';
import FormToggle from 'components/forms/form-toggle';
import Card from 'components/card';
module.exports = React.createClass( {

	displayName: 'AdsMain',

	componentWillMount: function() {
		debug( 'Mounting AdsMain React component.' );
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

		if ( AdsUtils.canAccessWordads( site ) ) {
			filters.push( {
				title: this.translate( 'Earnings' ),
				path: '/ads/earnings' + pathSuffix,
				id: 'ads-earnings'
			} );

			filters.push( {
				title: this.translate( 'Settings' ),
				path: '/ads/settings' + pathSuffix,
				id: 'ads-settings'
			} );
		}

		return filters;
	},

	getComponent: function( section ) {
		switch ( section ) {
			case 'earnings':
				return <AdsEarnings site={ this.props.site } />
			case 'settings':
				return <AdsSettings site={ this.props.site } />
			default:
				return null;
		}
	},

	renderInstanActivationToggle: function( component ) {
		return ( <div>
			<Card>
				<div className="ads__activate-header-description">
					<h2 className="form-section-heading">{ this.translate( 'WordAds Disabled' ) }</h2>
					<p>
						{ this.translate(
							'WordAds let you earn money from your site.' +
							'Stylish and unobtrusive promotional will help you monetize your blog. ' +
							'Because you have a premium plan, you can skip review process and activate WordAds instantly.' +
							'{{br/}}' +
							'{{a}}Read more about WordAds.{{/a}}', {
								components: {
									br: <br />,
									a: <a href={ 'http://wordads.co' } />
								}
							} )
						}
					</p>
				</div>
				<div className="ads__activate-header-toggle">
					<FormToggle
						checked={ false }
						onChange={ function() {} }
					/>
				</div>
			</Card>
			<FeatureExample>
				{ component }
			</FeatureExample>
		</div> );
	},

	render: function() {
		var component = this.getComponent( this.props.section );

		if ( ! this.props.site.options.wordads && isWordadsInstantActivationEligible( this.props.site ) ) {
			component = this.renderInstanActivationToggle( component );
		}

		return (
			<Main className="ads">
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
				{ component }
			</Main>
		);
	}
} );
