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
import Main from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import WordAdsEarnings from 'my-sites/stats/wordads/earnings';
import AdsSettings from 'my-sites/earn/ads/form-settings';
import { getSelectedSite, getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import DocumentHead from 'components/data/document-head';
import AdsWrapper from './ads/wrapper';
import MembershipsSection from './memberships';
import MembershipsProductsSection from './memberships/products';
import config from 'config';

class EarningsMain extends Component {
	static propTypes = {
		section: PropTypes.string.isRequired,
		site: PropTypes.object,
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

		tabs.push( {
			title: translate( 'Ads Earnings' ),
			path: '/earn/ads-earnings' + pathSuffix,
			id: 'ads-earnings',
		} );
		tabs.push( {
			title: translate( 'Ads Settings' ),
			path: '/earn/ads-settings' + pathSuffix,
			id: 'ads-settings',
		} );
		if ( config.isEnabled( 'memberships' ) ) {
			tabs.push( {
				title: translate( 'Memberships' ),
				path: '/earn/memberships' + pathSuffix,
				id: 'memberships',
			} );
		}
		return tabs;
	}

	getComponent( section ) {
		switch ( section ) {
			case 'ads-earnings':
				return (
					<AdsWrapper section={ this.props.section }>
						<WordAdsEarnings site={ this.props.site } />
					</AdsWrapper>
				);
			case 'ads-settings':
				return (
					<AdsWrapper section={ this.props.section }>
						<AdsSettings />
					</AdsWrapper>
				);
			case 'memberships':
				return <MembershipsSection section={ this.props.section } />;
			case 'memberships-products':
				return <MembershipsProductsSection section={ this.props.section } />;
			default:
				return null;
		}
	}

	handleDismissWordAdsError = () => {
		const { siteId } = this.props;
		this.props.dismissWordAdsError( siteId );
	};

	render() {
		const { adsProgramName, section, translate } = this.props;
		const component = this.getComponent( this.props.section );

		const layoutTitles = {
			earnings: translate( '%(wordads)s Earnings', { args: { wordads: adsProgramName } } ),
			settings: translate( '%(wordads)s Settings', { args: { wordads: adsProgramName } } ),
			memberships: translate( 'Memberships' ),
			'memberships-products': translate( 'Memberships' ),
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
