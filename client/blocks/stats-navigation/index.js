import config from '@automattic/calypso-config';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import version_compare from 'calypso/lib/version-compare';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isGoogleMyBusinessLocationConnectedSelector from 'calypso/state/selectors/is-google-my-business-location-connected';
import isSiteStore from 'calypso/state/selectors/is-site-store';
import { getJetpackStatsAdminVersion, getSiteOption } from 'calypso/state/sites/selectors';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import {
	updateModuleToggles,
	requestModuleToggles,
} from 'calypso/state/stats/module-toggles/actions';
import { getModuleToggles } from 'calypso/state/stats/module-toggles/selectors';
import { AVAILABLE_PAGE_MODULES, navItems, intervals as intervalConstants } from './constants';
import Intervals from './intervals';
import PageModuleToggler from './page-module-toggler';

import './style.scss';

// Use HOC to wrap hooks of `react-query` for fetching the notice visibility state.
function withNoticeHook( HookedComponent ) {
	return function WrappedComponent( props ) {
		const { data: showSettingsTooltip, refetch: refetchNotices } = useNoticeVisibilityQuery(
			props.siteId,
			'traffic_page_settings'
		);

		const { mutateAsync: mutateNoticeVisbilityAsync } = useNoticeVisibilityMutation(
			props.siteId,
			'traffic_page_settings'
		);

		return (
			<HookedComponent
				{ ...props }
				showSettingsTooltip={ showSettingsTooltip }
				refetchNotices={ refetchNotices }
				mutateNoticeVisbilityAsync={ mutateNoticeVisbilityAsync }
			/>
		);
	};
}

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
		adminUrl: PropTypes.string,
	};

	state = {
		// Dismiss the tooltip before the API call is finished.
		isPageSettingsTooltipDismissed: !! localStorage.getItem(
			'notices_dismissed__traffic_page_settings'
		),
		// Only traffic page modules are supported for now.
		pageModules: Object.assign(
			...AVAILABLE_PAGE_MODULES.traffic.map( ( module ) => {
				return {
					[ module.key ]: module.defaultValue,
				};
			} )
		),
	};

	static getDerivedStateFromProps( nextProps, prevState ) {
		if ( prevState.pageModules !== nextProps.pageModuleToggles ) {
			return { pageModules: nextProps.pageModuleToggles };
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

	onTooltipDismiss = () => {
		if ( this.state.isPageSettingsTooltipDismissed || ! this.props.showSettingsTooltip ) {
			return;
		}
		this.setState( { isPageSettingsTooltipDismissed: true } );
		localStorage.setItem( 'notices_dismissed__traffic_page_settings', 1 );
		this.props.mutateNoticeVisbilityAsync().finally( this.props.refetchNotices );
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

			case 'subscribers':
				if ( 'undefined' === typeof siteId ) {
					return false;
				}

			default:
				return true;
		}
	};

	componentDidMount() {
		this.props.requestModuleToggles( this.props.siteId );
	}

	render() {
		const { slug, selectedItem, interval, isLegacy, showSettingsTooltip, statsAdminVersion } =
			this.props;
		const { pageModules, isPageSettingsTooltipDismissed } = this.state;
		const { label, showIntervals, path } = navItems[ selectedItem ];
		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ path }/{{ interval }}${ slugPath }`;

		const wrapperClass = classNames( 'stats-navigation', {
			'stats-navigation--modernized': ! isLegacy,
		} );

		// Module settings for Odyssey are not supported until stats-admin@0.9.0-alpha.
		const isModuleSettingsSupported =
			! config.isEnabled( 'is_running_in_jetpack_site' ) ||
			!! ( statsAdminVersion && version_compare( statsAdminVersion, '0.9.0-alpha', '>=' ) );

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
								if ( item === 'store' && config.isEnabled( 'is_running_in_jetpack_site' ) ) {
									return (
										<NavItem
											className={ className }
											key={ item }
											onClick={ () =>
												( window.location.href = `${ this.props.adminUrl }admin.php?page=wc-admin&path=%2Fanalytics%2Foverview` )
											}
											selected={ false }
										>
											{ navItem.label }
										</NavItem>
									);
								}
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
				</SectionNav>

				{ isLegacy && showIntervals && (
					<Intervals selected={ interval } pathTemplate={ pathTemplate } standalone />
				) }

				{ ! isLegacy &&
					isModuleSettingsSupported &&
					AVAILABLE_PAGE_MODULES[ this.props.selectedItem ] && (
						<PageModuleToggler
							availableModules={ AVAILABLE_PAGE_MODULES[ this.props.selectedItem ] }
							pageModules={ pageModules }
							onToggleModule={ this.onToggleModule }
							isTooltipShown={ showSettingsTooltip && ! isPageSettingsTooltipDismissed }
							onTooltipDismiss={ this.onTooltipDismiss }
						/>
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
			pageModuleToggles: getModuleToggles( state, siteId, [ selectedItem ] ),
			statsAdminVersion: getJetpackStatsAdminVersion( state, siteId ),
			adminUrl: getSiteAdminUrl( state, siteId ),
		};
	},
	{ requestModuleToggles, updateModuleToggles }
)( localize( withNoticeHook( StatsNavigation ) ) );
