import config from '@automattic/calypso-config';
import { Popover } from '@automattic/components';
import { FormToggle } from '@wordpress/components';
import { Icon, cog, commentAuthorAvatar, video } from '@wordpress/icons';
import classNames from 'classnames';
import { localize, translate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, createRef } from 'react';
import { connect } from 'react-redux';
import SubscribersCount from 'calypso/blocks/subscribers-count';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isGoogleMyBusinessLocationConnectedSelector from 'calypso/state/selectors/is-google-my-business-location-connected';
import isSiteStore from 'calypso/state/selectors/is-site-store';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { navItems, intervals as intervalConstants } from './constants';
import Intervals from './intervals';

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
		isPageSettingsPopoverVisible: false,
		modules: {
			traffic: { authors: true, videos: true },
		},
	};

	settingsActionRef = createRef();

	togglePopoverMenu = ( isPageSettingsPopoverVisible ) => {
		this.setState( { isPageSettingsPopoverVisible } );
	};

	onToggleModule = ( page, module, value ) => {
		const seletedPageModules = this.state.modules[ page ] || {};
		seletedPageModules[ module ] = value;

		this.setState( seletedPageModules );
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

	render() {
		const { slug, selectedItem, interval, isLegacy } = this.props;
		const { isPageSettingsPopoverVisible } = this.state;
		const { label, showIntervals, path } = navItems[ selectedItem ];
		const slugPath = slug ? `/${ slug }` : '';
		const pathTemplate = `${ path }/{{ interval }}${ slugPath }`;

		const wrapperClass = classNames( 'stats-navigation', {
			'stats-navigation--modernized': ! isLegacy,
		} );

		const isHighlightsSettingsEnabled = config.isEnabled( 'stats/module-settings' );

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
				</SectionNav>
				{ isLegacy && showIntervals && (
					<Intervals selected={ interval } pathTemplate={ pathTemplate } standalone />
				) }
				{ isHighlightsSettingsEnabled && (
					<div className="page-modules-settings">
						<button
							className="page-modules-settings-action"
							ref={ this.settingsActionRef }
							onClick={ () => {
								this.togglePopoverMenu( ! isPageSettingsPopoverVisible );
							} }
						>
							<Icon className="gridicon" icon={ cog } />
						</button>
						<Popover
							className="tooltip highlight-card-popover page-modules-settings-popover"
							isVisible={ isPageSettingsPopoverVisible }
							position="bottom left"
							context={ this.settingsActionRef.current }
							focusOnShow={ false }
						>
							<div>{ translate( 'Modules visibility' ) }</div>
							<div className="page-modules-settings-toggle-wrapper">
								<div className="page-modules-settings-toggle">
									<Icon className="gridicon" icon={ commentAuthorAvatar } />
									<span>{ translate( 'Authors' ) }</span>
									<FormToggle
										className="page-modules-settings-toggle-control"
										checked={ this.state.modules[ this.props.selectedItem ].authors }
										onChange={ ( event ) => {
											this.onToggleModule(
												this.props.selectedItem,
												'authors',
												event.target.checked
											);
										} }
									/>
								</div>
								<div className="page-modules-settings-toggle">
									<Icon className="gridicon" icon={ video } />
									<span>{ translate( 'Videos' ) }</span>
									<FormToggle
										className="page-modules-settings-toggle-control"
										checked={ this.state.modules[ this.props.selectedItem ].videos }
										onChange={ ( event ) => {
											this.onToggleModule(
												this.props.selectedItem,
												'videos',
												event.target.checked
											);
										} }
									/>
								</div>
							</div>
						</Popover>
					</div>
				) }
			</div>
		);
	}
}

export default connect( ( state, { siteId } ) => {
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
	};
} )( localize( StatsNavigation ) );
