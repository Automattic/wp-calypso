/** @format */
/**
 * External Dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SectionNav from 'components/section-nav';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import Intervals from './intervals';
import FollowersCount from 'blocks/followers-count';
import {
	isGoogleMyBusinessLocationConnected as isGoogleMyBusinessLocationConnectedSelector,
	isSiteStore,
} from 'state/selectors';
import { isJetpackSite } from 'state/sites/selectors';
import { navItems, intervals as intervalConstants } from './constants';
import config from 'config';

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
		const { isGoogleMyBusinessLocationConnected, isStore, isJetpack, siteId } = this.props;

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

				return config.isEnabled( 'activity-log-simple-sites' );

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
	return {
		isGoogleMyBusinessLocationConnected: isGoogleMyBusinessLocationConnectedSelector( state, siteId ),
		isStore: isSiteStore( state, siteId ),
		isJetpack: isJetpackSite( state, siteId ),
		siteId,
	};
} )( StatsNavigation );
