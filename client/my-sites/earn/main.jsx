/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { capitalize, find } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import HeaderCake from 'components/header-cake';
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import AdsSettings from 'my-sites/earn/ads/form-settings';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import Home from './home';
import AdsSection from './ads/index';
import MembershipsSection from './memberships';
import MembershipsProductsSection from './memberships/products';
import { canAccessAds } from 'lib/ads/utils';

class EarningsMain extends Component {
	static propTypes = {
		section: PropTypes.string,
		site: PropTypes.object,
		query: PropTypes.object,
	};

	getSelectedText() {
		const selected = find( this.getFilters(), { path: this.props.path } );
		if ( selected ) {
			return selected.title;
		}

		return '';
	}

	getFilters() {
		const { siteSlug, translate } = this.props;
		const pathSuffix = siteSlug ? '/' + siteSlug : '';
		const tabs = [];

		if ( canAccessAds( this.props.site ) ) {
			tabs.push( {
				title: translate( 'Ads' ),
				path: '/earn/ads' + pathSuffix,
				id: 'ads',
			} );
		}

		return tabs;
	}

	getComponent( section ) {
		switch ( section ) {
			case 'ads':
				return (
					<AdsSection section={ this.props.section }>
						<AdsSettings />
					</AdsSection>
				);
			case 'payments':
				return <MembershipsSection section={ this.props.section } query={ this.props.query } />;
			case 'payments-plans':
				return <MembershipsProductsSection section={ this.props.section } />;
			default:
				return <Home />;
		}
	}

	handleDismissWordAdsError = () => {
		const { siteId } = this.props;
		this.props.dismissWordAdsError( siteId );
	};

	/**
	 * Remove any query parameters from the path before using it to
	 * identify which screen the user is seeing.
	 *
	 * @returns {String} Path to current screen.
	 */
	getCurrentPath = () => {
		let currentPath = this.props.path;
		const queryStartPosition = currentPath.indexOf( '?' );
		if ( queryStartPosition > -1 ) {
			currentPath = currentPath.substring( 0, queryStartPosition );
		}
		return currentPath;
	};

	/**
	 * Check the current path and returns an appropriate title.
	 *
	 * @returns {String} Header text for current screen.
	 */
	getHeaderText = () => {
		const { translate } = this.props;

		switch ( this.props.section ) {
			case 'payments':
				return translate( 'Recurring Payments' );

			case 'ads':
			case 'ads-earnings':
			case 'ads-settings':
				return translate( 'Ads' );

			default:
				return '';
		}
	};

	/**
	 * Goes back to Earn home.
	 *
	 * @returns {string} Path to Earn home. Has site slug append if it exists.
	 */
	goBack = () => ( this.props.siteSlug ? '/earn/' + this.props.siteSlug : '' );

	getHeaderCake = () => {
		const headerText = this.getHeaderText();
		return headerText && <HeaderCake backHref={ this.goBack() }>{ headerText }</HeaderCake>;
	};

	getSectionNav = section => {
		const currentPath = this.getCurrentPath();

		return (
			! section.startsWith( 'payments' ) && (
				<SectionNav selectedText={ this.getSelectedText() }>
					<NavTabs>
						{ this.getFilters().map( filterItem => {
							return (
								<NavItem
									key={ filterItem.id }
									path={ filterItem.path }
									selected={ filterItem.path === currentPath }
								>
									{ filterItem.title }
								</NavItem>
							);
						} ) }
					</NavTabs>
				</SectionNav>
			)
		);
	};

	render() {
		const { adsProgramName, section, translate } = this.props;
		const component = this.getComponent( this.props.section );

		const layoutTitles = {
			earnings: translate( '%(wordads)s Earnings', { args: { wordads: adsProgramName } } ),
			settings: translate( '%(wordads)s Settings', { args: { wordads: adsProgramName } } ),
			payments: translate( 'Recurring Payments' ),
			'payments-plans': translate( 'Recurring Payments plans' ),
		};

		return (
			<Main className="earn is-wide-layout">
				<PageViewTracker
					path={ section ? `/earn/${ section }/:site` : `/earn/:site` }
					title={ `${ adsProgramName } ${ capitalize( section ) }` }
				/>
				<DocumentHead title={ layoutTitles[ section ] } />
				<SidebarNavigation />
				{ this.getHeaderCake() }
				{ /* section && this.getSectionNav( section ) */ }
				{ component }
			</Main>
		);
	}
}

export default connect( state => ( {
	site: getSelectedSite( state ),
	siteId: getSelectedSiteId( state ),
	siteSlug: getSelectedSiteSlug( state ),
} ) )( localize( EarningsMain ) );
