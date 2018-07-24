/** @format */
/**
 * External Dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import Intervals from './intervals';
import FollowersCount from 'blocks/followers-count';
import isGoogleMyBusinessLocationConnectedSelector from 'state/selectors/is-google-my-business-location-connected';
import isSiteStore from 'state/selectors/is-site-store';
import { isJetpackSite } from 'state/sites/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import { navItems, intervals as intervalConstants } from './constants';
import config from 'config';
import { isWpComFreePlan } from 'lib/plans';

class StatsNavigation extends Component {
	static propTypes = {
		interval: PropTypes.oneOf( intervalConstants.map( i => i.value ) ),
		isGoogleMyBusinessLocationConnected: PropTypes.bool.isRequired,
		isStore: PropTypes.bool,
		selectedItem: PropTypes.oneOf( Object.keys( navItems ) ).isRequired,
		siteId: PropTypes.number,
		slug: PropTypes.string,
	};

	isValidItem = item => {
		const {
			isGoogleMyBusinessLocationConnected,
			isStore,
			isJetpack,
			siteId,
			isWpComPaidPlan,
		} = this.props;

		switch ( item ) {
			case 'store':
				return isStore;

			case 'activity':
				if ( 'undefined' === typeof siteId ) {
					return false;
				}

				if ( isJetpack ) {
					return true;
				}

				if ( isWpComPaidPlan ) {
					return true;
				}

				return config.isEnabled( 'activity-log-wpcom-free' );

			case 'googleMyBusiness':
				if ( 'undefined' === typeof siteId ) {
					return false;
				}

				return config.isEnabled( 'google-my-business' ) && isGoogleMyBusinessLocationConnected;

			default:
				return true;
		}
	};

	render() {
		const { slug, selectedItem, interval } = this.props;
		const { label, showIntervals, path } = navItems[ selectedItem ];
		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ path }/{{ interval }}${ slugPath }`;
		return (
			<div className="stats-navigation">
				<SectionNav selectedText={ label }>
					<NavTabs label={ 'Stats' } selectedText={ label }>
						{ Object.keys( navItems )
							.filter( this.isValidItem )
							.map( item => {
								const navItem = navItems[ item ];
								const intervalPath = navItem.showIntervals ? `/${ interval || 'day' }` : '';
								const itemPath = `${ navItem.path }${ intervalPath }${ slugPath }`;
								return (
									<NavItem key={ item } path={ itemPath } selected={ selectedItem === item }>
										{ navItem.label }
									</NavItem>
								);
							} ) }
					</NavTabs>
					{ showIntervals && <Intervals selected={ interval } pathTemplate={ pathTemplate } /> }
					<FollowersCount />
				</SectionNav>
				{ showIntervals && (
					<Intervals selected={ interval } pathTemplate={ pathTemplate } standalone />
				) }
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => {
	const productSlug = get( getCurrentPlan( state, siteId ), 'productSlug' );
	return {
		isGoogleMyBusinessLocationConnected: isGoogleMyBusinessLocationConnectedSelector(
			state,
			siteId
		),
		isStore: isSiteStore( state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
		isWpComPaidPlan: ! isWpComFreePlan( productSlug ),
		siteId,
	};
} )( StatsNavigation );
