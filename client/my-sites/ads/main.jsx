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
import FormButton from 'components/forms/form-button';
import Card from 'components/card';
import { requestWordAdsApproval, dismissWordAdsError } from 'state/wordads/approve/actions';
import {
	isRequestingWordAdsApprovalForSite,
	getWordAdsErrorForSite,
	getWordAdsSuccessForSite
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
			<Card className="rads__activate-wrapper">
				<div className="rads__activate-header">
					<h2 className="rads__activate-header-title">{ this.translate( 'WordAds Disabled' ) }</h2>
					<div className="rads__activate-header-toggle">
						<FormButton
							disabled={ this.props.site.options.wordads || ( this.props.requestingWordAdsApproval && this.props.wordAdsError === null ) }
							onClick={ this.props.requestWordAdsApproval }
						>
							{ this.translate( 'Join WordAds' ) }
						</FormButton>
					</div>
				</div>
				{ this.props.wordAdsError &&
					<Notice status="is-error rads__activate-notice" onDismissClick={ this.dismissWordAdsError }>
						{ this.props.wordAdsError }
					</Notice>
				}
				<p className="rads__activate-description">
					{ this.translate(
						'WordAds allows you to make money from advertising that runs on your site. ' +
						'Because you have a WordPress.com Premium plan, you can skip the review process and activate WordAds instantly. ' +
						'{{a}}Learn more about the program.{{/a}}', {
							components: {
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
		let component = this.getComponent( this.props.section );
		let notice = null;

		if ( this.props.requestingWordAdsApproval || this.props.wordAdsSuccess ) {
			notice = (
				<Notice status="is-success" showDismiss={ false }>
					{ this.translate( 'You have joined the WordAds program. Please review these settings:' ) }
				</Notice>
			);
		} else if ( ! this.props.site.options.wordads && isWordadsInstantActivationEligible( this.props.site ) ) {
			component = this.renderInstantActivationToggle( component );
		}

		return (
			<Main className="rads">
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
				{ notice }
				{ component }
			</Main>
		);
	}
} );

export default connect(
	( state, ownProps ) => ( {
		requestingWordAdsApproval: isRequestingWordAdsApprovalForSite( state, ownProps.site ),
		wordAdsError: getWordAdsErrorForSite( state, ownProps.site ),
		wordAdsSuccess: getWordAdsSuccessForSite( state, ownProps.site ),
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
