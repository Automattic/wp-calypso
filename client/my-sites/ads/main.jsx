/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:ads-settings' ),
	find = require( 'lodash/find' );
import { connect } from 'react-redux';

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
import { requestWordAdsApproval, dismissWordAdsError } from 'state/wordads/approve/actions';
import {
	isRequestingWordAdsApprovalForSite,
	getWordAdsErrorForSite
} from 'state/wordads/approve/selectors';
import Notice from 'components/notice';

const AdsMain = React.createClass( {

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
				return <AdsEarnings site={ this.props.site } />;
			case 'settings':
				return <AdsSettings site={ this.props.site } />;
			default:
				return null;
		}
	},

	dismissWordAdsError() {
		const siteId = this.props.site ? this.props.site.ID : null;
		this.props.dismissWordAdsError( siteId );
	},

	renderInstantActivationToggle: function( component ) {
		return ( <div>
			<Card className="ads__activate-wrapper">
				<div className="ads__activate-header">
					<h2 className="ads__activate-header-title">{ this.translate( 'WordAds Disabled' ) }</h2>
					<div className="ads__activate-header-toggle">
						<FormToggle
							checked={ this.props.site.options.wordads || ( this.props.requestingWordAdsApproval && this.props.wordAdsError === null ) }
							onChange={ this.props.requestWordAdsApproval }
						/>
					</div>
				</div>
				{ this.props.wordAdsError &&
					<Notice status="is-error ads__activate-notice" onDismissClick={ this.dismissWordAdsError }>
						{ this.props.wordAdsError }
					</Notice>
				}
				{ this.props.requestingWordAdsApproval &&
					<Notice status="is-info ads__activate-notice" showDismiss={ false }>
						{ this.translate( 'Kindly requesting WordAds activation' ) }
					</Notice>
				}
				<p className="ads__activate-description">
					{ this.translate(
						'WordAds allows you to make money from advertising that runs on your site. ' +
						'Because you have a WordPress.com Premium plan, you can skip the review process and activate WordAds instantly. ' +
						'{{br/}}' +
						'{{a}}Learn more about the program.{{/a}}', {
							components: {
								br: <br />,
								a: <a href={ 'http://wordads.co' } />
							}
						} )
					}
				</p>

			</Card>
			<FeatureExample>
				{ component }
			</FeatureExample>
		</div> );
	},

	render: function() {
		var component = this.getComponent( this.props.section );

		if ( ! this.props.site.options.wordads && isWordadsInstantActivationEligible( this.props.site ) ) {
			component = this.renderInstantActivationToggle( component );
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

export default connect(
	( state, ownProps ) => ( {
		requestingWordAdsApproval: isRequestingWordAdsApprovalForSite( state, ownProps.site ),
		wordAdsError: getWordAdsErrorForSite( state, ownProps.site )
	} ),
	{ requestWordAdsApproval, dismissWordAdsError },
	( stateProps, dispatchProps, parentProps ) => Object.assign(
		{},
		dispatchProps,
		{ requestWordAdsApproval: () => ( ! stateProps.requestingWordAdsApproval ) ? dispatchProps.requestWordAdsApproval( parentProps.site.ID ) : null },
		parentProps,
		stateProps
	)
)( AdsMain );
