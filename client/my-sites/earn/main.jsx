/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import page from 'page';
import { capitalize, find } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import WordAdsEarnings from 'my-sites/stats/wordads/earnings';
import AdsSettings from 'my-sites/earn/ads/form-settings';
import { canAccessWordads, isWordadsInstantActivationEligible } from 'lib/ads/utils';
import { isBusiness } from 'lib/products-values';
import FeatureExample from 'components/feature-example';
import FormButton from 'components/forms/form-button';
import Card from 'components/card';
import { requestWordAdsApproval, dismissWordAdsError } from 'state/wordads/approve/actions';
import {
	isRequestingWordAdsApprovalForSite,
	getWordAdsErrorForSite,
	getWordAdsSuccessForSite,
} from 'state/wordads/approve/selectors';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import QueryWordadsStatus from 'components/data/query-wordads-status';
import canCurrentUser from 'state/selectors/can-current-user';
import { getSiteFragment } from 'lib/route';
import { isSiteWordadsUnsafe } from 'state/wordads/status/selectors';
import { wordadsUnsafeValues } from 'state/wordads/status/schema';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import { isJetpackSite } from 'state/sites/selectors';

class AdsMain extends Component {
	static propTypes = {
		adsProgramName: PropTypes.string,
		isUnsafe: PropTypes.oneOf( wordadsUnsafeValues ),
		requestingWordAdsApproval: PropTypes.bool.isRequired,
		requestWordAdsApproval: PropTypes.func.isRequired,
		section: PropTypes.string.isRequired,
		site: PropTypes.object,
		wordAdsError: PropTypes.string,
		wordAdsSuccess: PropTypes.bool,
	};

	// componentDidMount() {
	// 	this.redirectToStats();
	// }
	//
	// componentDidUpdate() {
	// 	this.redirectToStats();
	// }

	canAccess() {
		const { canManageOptions, site } = this.props;
		return site && canManageOptions && canAccessWordads( site );
	}

	redirectToStats() {
		const { siteSlug } = this.props;
		const siteFragment = getSiteFragment( page.current );

		if ( ! this.canAccess() && siteSlug ) {
			page( '/stats/' + siteSlug );
		} else if ( ! siteFragment ) {
			page( '/stats/' );
		}
	}

	getSelectedText() {
		const selected = find( this.getFilters(), { path: this.props.path } );
		if ( selected ) {
			return selected.title;
		}

		return '';
	}

	getFilters() {
		const { site, siteSlug, translate } = this.props;
		const pathSuffix = siteSlug ? '/' + siteSlug : '';

		return canAccessWordads( site )
			? [
					{
						title: translate( 'Earnings' ),
						path: '/ads/earnings' + pathSuffix,
						id: 'ads-earnings',
					},
					{
						title: translate( 'Settings' ),
						path: '/ads/settings' + pathSuffix,
						id: 'ads-settings',
					},
			  ]
			: [];
	}

	getComponent( section ) {
		switch ( section ) {
			case 'earnings':
				return <WordAdsEarnings site={ this.props.site } />;
			case 'settings':
				return <AdsSettings />;
			default:
				return null;
		}
	}

	handleDismissWordAdsError = () => {
		const { siteId } = this.props;
		this.props.dismissWordAdsError( siteId );
	};

	renderInstantActivationToggle( component ) {
		const { siteId, translate } = this.props;

		return (
			<div>
				<QueryWordadsStatus siteId={ siteId } />
				<Card className="ads__activate-wrapper">
					<div className="ads__activate-header">
						<h2 className="ads__activate-header-title">{ translate( 'WordAds Disabled' ) }</h2>
						<div className="ads__activate-header-toggle">
							<FormButton
								disabled={
									this.props.site.options.wordads ||
									( this.props.requestingWordAdsApproval && this.props.wordAdsError === null ) ||
									this.props.isUnsafe !== false
								}
								onClick={ this.props.requestWordAdsApproval }
							>
								{ translate( 'Join WordAds' ) }
							</FormButton>
						</div>
					</div>
					{ this.props.wordAdsError && (
						<Notice
							classname="ads__activate-notice"
							status="is-error"
							onDismissClick={ this.handleDismissWordAdsError }
						>
							{ this.props.wordAdsError }
						</Notice>
					) }
					{ this.props.isUnsafe === 'mature' && (
						<Notice
							classname="ads__activate-notice"
							status="is-warning"
							showDismiss={ false }
							text={ translate(
								'Your site has been identified as serving mature content. ' +
									'Our advertisers would like to include only family-friendly sites in the program.'
							) }
						>
							<NoticeAction
								href="https://wordads.co/2012/09/06/wordads-is-for-family-safe-sites/"
								external={ true }
							>
								{ translate( 'Learn more' ) }
							</NoticeAction>
						</Notice>
					) }
					{ this.props.isUnsafe === 'spam' && (
						<Notice
							classname="ads__activate-notice"
							status="is-warning"
							showDismiss={ false }
							text={ translate(
								'Your site has been identified as serving automatically created or copied content. ' +
									'We cannot serve WordAds on these kind of sites.'
							) }
						/>
					) }
					{ this.props.isUnsafe === 'private' && (
						<Notice
							classname="ads__activate-notice"
							status="is-warning"
							showDismiss={ false }
							text={ translate(
								'Your site is marked as private. It needs to be public so that visitors can see the ads.'
							) }
						>
							<NoticeAction href={ '/settings/general/' + this.props.siteSlug }>
								{ translate( 'Change privacy settings' ) }
							</NoticeAction>
						</Notice>
					) }
					{ this.props.isUnsafe === 'other' && (
						<Notice
							classname="ads__activate-notice"
							status="is-warning"
							showDismiss={ false }
							text={ translate( 'Your site cannot participate in WordAds program.' ) }
						/>
					) }
					<p className="ads__activate-description">
						{ translate(
							'WordAds allows you to make money from advertising that runs on your site. ' +
								'Because you have a WordPress.com Premium plan, you can skip the review process and activate WordAds instantly. ' +
								'{{a}}Learn more about the program.{{/a}}',
							{
								components: {
									a: <a href={ 'http://wordads.co' } />,
								},
							}
						) }
					</p>
				</Card>
				<FeatureExample>{ component }</FeatureExample>
			</div>
		);
	}

	render() {
		const { adsProgramName, section, site, translate } = this.props;

		if ( ! this.canAccess() ) {
			return null;
		}

		let component = this.getComponent( this.props.section );
		let notice = null;

		if ( this.props.requestingWordAdsApproval || this.props.wordAdsSuccess ) {
			notice = (
				<Notice status="is-success" showDismiss={ false }>
					{ translate( 'You have joined the WordAds program. Please review these settings:' ) }
				</Notice>
			);
		} else if (
			! site.options.wordads &&
			isWordadsInstantActivationEligible( site ) &&
			! isBusiness( site.plan )
		) {
			component = this.renderInstantActivationToggle( component );
		}

		const layoutTitles = {
			earnings: translate( '%(wordads)s Earnings', { args: { wordads: adsProgramName } } ),
			settings: translate( '%(wordads)s Settings', { args: { wordads: adsProgramName } } ),
		};

		return (
			<Main className="earn">
				<PageViewTracker
					path={ `/earn/${ section }/:site` }
					title={ `${ adsProgramName } ${ capitalize( section ) }` }
				/>
				<DocumentHead title={ layoutTitles[ section ] } />
				<SidebarNavigation />
				<SectionNav selectedText={ this.getSelectedText() }>
					<NavTabs>
						{ this.getFilters().map( filterItem => {
							return (
								<NavItem
									key={ filterItem.id }
									path={ filterItem.path }
									selected={ filterItem.path === this.props.path }
								>
									{ filterItem.title }
								</NavItem>
							);
						} ) }
					</NavTabs>
				</SectionNav>
				{ notice }
				{ component }
			</Main>
		);
	}
}

const mapStateToProps = state => {
	const site = getSelectedSite( state );
	const siteId = getSelectedSiteId( state );
	return {
		site,
		siteId,
		siteSlug: getSelectedSiteSlug( state ),
		canManageOptions: canCurrentUser( state, siteId, 'manage_options' ),
		requestingWordAdsApproval: isRequestingWordAdsApprovalForSite( state, site ),
		wordAdsError: getWordAdsErrorForSite( state, site ),
		wordAdsSuccess: getWordAdsSuccessForSite( state, site ),
		isUnsafe: isSiteWordadsUnsafe( state, siteId ),
		adsProgramName: isJetpackSite( state, siteId ) ? 'Ads' : 'WordAds',
	};
};

const mapDispatchToProps = {
	requestWordAdsApproval,
	dismissWordAdsError,
};

const mergeProps = ( stateProps, dispatchProps, parentProps ) => ( {
	...dispatchProps,
	requestWordAdsApproval: () =>
		! stateProps.requestingWordAdsApproval
			? dispatchProps.requestWordAdsApproval( stateProps.siteId )
			: null,
	...parentProps,
	...stateProps,
} );

export default connect(
	mapStateToProps,
	mapDispatchToProps,
	mergeProps
)( localize( AdsMain ) );
