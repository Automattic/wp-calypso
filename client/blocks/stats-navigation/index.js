import config from '@automattic/calypso-config';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SubscribersCount from 'calypso/blocks/subscribers-count';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isGoogleMyBusinessLocationConnectedSelector from 'calypso/state/selectors/is-google-my-business-location-connected';
import isSiteStore from 'calypso/state/selectors/is-site-store';
import { getSiteOption } from 'calypso/state/sites/selectors';
import {
	updateModuleToggles,
	requestModuleToggles,
} from 'calypso/state/stats/module-toggles/actions';
import { getModuleToggles } from 'calypso/state/stats/module-toggles/selectors';
import { AVAILABLE_PAGE_MODULES, navItems, intervals as intervalConstants } from './constants';
import Intervals from './intervals';
import PageModuleToggler from './page-module-toggler';

import './style.scss';

class StatsNavigation extends Component {
	static propTypes = {
		interval: PropTypes.oneOf( intervalConstants.map( ( i ) => i.value ) ),
		isGoogleMyBusinessLocationConnected: PropTypes.bool.isRequired,
		isStore: PropTypes.bool,
		isWordAds: PropTypes.bool,
		selectedItem: PropTypes.oneOf( Object.keys( navItems ) ).isRequired,
		siteId: PropTypes.number,
		slug: PropTypes.string,
		isLegacy: PropTypes.bool,
	};

	state = {
		pageModules: {
			// Only traffic page modules are supported for now.
			traffic: Object.assign(
				...AVAILABLE_PAGE_MODULES.traffic.map( ( module ) => {
					return {
						[ module.key ]: module.defaultValue,
					};
				} )
			),
		},
	};

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( prevState.pageModules !== nextProps.moduleToggles ) {
			return { pageModules: nextProps.moduleToggles };
		}

		return null;
	}

	onToggleModule = ( module, isShow ) => {
		const seletedPageModules = Object.assign( {}, this.state.pageModules );
		seletedPageModules[ module ] = isShow;

		this.setState( { pageModules: seletedPageModules } );

		this.props.updateModuleToggles( this.props.siteId, {
			[ this.props.selectedItem ]: seletedPageModules,
		} );
	};

	isValidItem = ( item ) => {
		const { isGoogleMyBusinessLocationConnected, isStore, isWordAds, siteId } = this.props;

		switch ( item ) {
			case 'wordads':
				return isWordAds;

			case 'store':
				return isStore;

			case 'googleMyBusiness':
				if ( 'undefined' === typeof siteId ) {
					return false;
				}

				return config.isEnabled( 'google-my-business' ) && isGoogleMyBusinessLocationConnected;

			default:
				return true;
		}
	};

	componentDidMount() {
		this.props.requestModuleToggles( this.props.siteId );
	}

	render() {
		const { slug, selectedItem, interval, isLegacy } = this.props;
		const { pageModules } = this.state;
		const { label, showIntervals, path } = navItems[ selectedItem ];
		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ path }/{{ interval }}${ slugPath }`;

		const wrapperClass = classNames( 'stats-navigation', {
			'stats-navigation--modernized': ! isLegacy,
		} );

		const isHighlightsSettingsEnabled = config.isEnabled( 'stats/module-settings' );

		// @TODO: Add loading status of modules settings to avoid toggling modules before they are loaded.

		return (
			<div className={ wrapperClass }>
				<SectionNav selectedText={ label }>
					<NavTabs selectedText={ label }>
						{ Object.keys( navItems )
							.filter( this.isValidItem )
							.map( ( item ) => {
								const navItem = navItems[ item ];
								const intervalPath = navItem.showIntervals ? `/${ interval || 'day' }` : '';
								const itemPath = `${ navItem.path }${ intervalPath }${ slugPath }`;
								const className = 'stats-navigation__' + item;
								return (
									<NavItem
										className={ className }
										key={ item }
										path={ itemPath }
										selected={ selectedItem === item }
									>
										{ navItem.label }
									</NavItem>
								);
							} ) }
					</NavTabs>

					{ isLegacy && showIntervals && (
						<Intervals selected={ interval } pathTemplate={ pathTemplate } />
					) }

					{ ! config.isEnabled( 'stats/subscribers-section' ) && <SubscribersCount /> }

					{ isHighlightsSettingsEnabled && AVAILABLE_PAGE_MODULES[ this.props.selectedItem ] && (
						<PageModuleToggler
							availableModules={ AVAILABLE_PAGE_MODULES[ this.props.selectedItem ] }
							pageModules={ pageModules }
							onToggleModule={ this.onToggleModule }
						/>
					) }
				</SectionNav>

				{ isLegacy && showIntervals && (
					<Intervals selected={ interval } pathTemplate={ pathTemplate } standalone />
				) }
			</div>
		);
	}
}

export default connect(
	( state, { siteId, selectedItem } ) => {
		return {
			isGoogleMyBusinessLocationConnected: isGoogleMyBusinessLocationConnectedSelector(
				state,
				siteId
			),
			isStore: isSiteStore( state, siteId ),
			isWordAds:
				getSiteOption( state, siteId, 'wordads' ) &&
				canCurrentUser( state, siteId, 'manage_options' ),
			siteId,
			moduleToggles: getModuleToggles( state, siteId, [ selectedItem ] ),
		};
	},
	{ requestModuleToggles, updateModuleToggles }
)( localize( StatsNavigation ) );
