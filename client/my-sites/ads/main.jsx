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
import NoticeAction from 'components/notice/notice-action';
import QueryWordadsStatus from 'components/data/query-wordads-status';
import { isSiteWordadsUnsafe, isRequestingWordadsStatus } from 'state/wordads/status/selectors';
import { wordadsUnsafeValues } from 'state/wordads/status/schema';

const AdsMain = React.createClass( {

	displayName: 'AdsMain',

	PropTypes: {
		site: React.PropTypes.object.isRequired,
		requestingWordAdsApproval: React.PropTypes.bool.isRequired,
		requestWordAdsApproval: React.PropTypes.func.isRequired,
		wordAdsError: React.PropTypes.string.isRequired,
		isRequestingWordadsStatus: React.PropTypes.bool.isRequired,
		isUnsafe: React.PropTypes.oneOf( wordadsUnsafeValues ),
		section: React.PropTypes.string.isRequired,
		wordAdsSuccess: React.PropTypes.bool.isRequired
	},

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
			<QueryWordadsStatus siteId={ this.props.site.ID } />
			<Card className="rads__activate-wrapper">
				<div className="rads__activate-header">
					<h2 className="rads__activate-header-title">{ this.translate( 'WordAds Disabled' ) }</h2>
					<div className="rads__activate-header-toggle">
						<FormButton
							disabled={
								this.props.site.options.wordads ||
								( this.props.requestingWordAdsApproval && this.props.wordAdsError === null ) ||
								this.props.isRequestingWordadsStatus ||
								this.props.isUnsafe !== false
							}
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
				{ this.props.isUnsafe === 'mature' &&
					<Notice
						status="is-warning rads__activate-notice"
						showDismiss={ false }
						text={ this.translate( 'Your site has been identified as serving mature content. Our advertisers would like to include only family-friendly sites in the program.' ) }
					>
						<NoticeAction href="https://wordads.co/2012/09/06/wordads-is-for-family-safe-sites/" external={ true }>
							{ this.translate( 'Learn more' ) }
						</NoticeAction>
					</Notice>
				}
				{ this.props.isUnsafe === 'spam' &&
					<Notice
						status="is-warning rads__activate-notice"
						showDismiss={ false }
						text={ this.translate( 'Your site has been identified as serving automatically created or copied content. We cannot serve WordAds on these kind of sites.' ) }
					>
					</Notice>
				}
				{ this.props.isUnsafe === 'private' &&
					<Notice
						status="is-warning rads__activate-notice"
						showDismiss={ false }
						text={ this.translate( 'Your site is marked as private. It needs to be public so that visitors can see the ads.' ) }
					>
						<NoticeAction href={ '/settings/general/' + this.props.site.slug }>
							{ this.translate( 'Change privacy settings' ) }
						</NoticeAction>
					</Notice>
				}
				{ this.props.isUnsafe === 'other' &&
					<Notice
						status="is-warning rads__activate-notice"
						showDismiss={ false }
						text={ this.translate( 'Your site cannot participate in WordAds program.' ) }
					>
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
		isUnsafe: isSiteWordadsUnsafe( state, ownProps.site.ID ),
		isRequestingWordadsStatus: isRequestingWordadsStatus( state, ownProps.site.ID )
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
