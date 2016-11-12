/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import SidebarButton from 'layout/sidebar/button';
import SidebarHeading from 'layout/sidebar/heading';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import { canCurrentUser } from 'state/current-user/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import { getCustomizeUrl } from 'my-sites/themes/helpers';

class AppearanceMenu extends Component {

	static propTypes = {
		path: PropTypes.string,
		site: PropTypes.object.isRequired,
		sites: PropTypes.object.isRequired,
	}

	isSingle() {
		return !! ( this.props.site || this.props.sites.get().length === 1 );
	}

	isItemLinkSelected( path ) {
		return path === this.props.path || includes( this.props.path, path + '/' );
	}

	renderThemesOption() {
		const { site, translate, userCanCustomize } = this.props;
		const jetpackEnabled = config.isEnabled( 'manage/themes-jetpack' );
		const themeManagementEnabled = config.isEnabled( 'manage/themes' );
		let link = '/design';

		if ( ( site && ! userCanCustomize ) || ! themeManagementEnabled ) {
			return null;
		}

		if ( site.jetpack && ! jetpackEnabled && site.options ) {
			link = site.options.admin_url + 'themes.php';
		} else if ( this.isSingle() ) {
			link = '/design/' + site.slug;
		}

		return (
			<SidebarItem
				label={ translate( 'Themes' ) }
				tipTarget="themes"
				className="themes"
				link={ link }
				onNavigate={ this.onNavigate }
				icon="themes"
				preloadSectionName="themes"
				selected={ this.isItemLinkSelected( '/design' ) }
			>
				<SidebarButton href={ getCustomizeUrl( null, site ) } preloadSectionName="customize">
					{ translate( 'Customize' ) }
				</SidebarButton>
			</SidebarItem>
		);
	}

	renderMenusOption() {
		const { site, translate, userCanCustomize } = this.props;
		const showClassicLink = ! config.isEnabled( 'manage/menus' );

		if ( ! site || ! userCanCustomize || ! this.isSingle() ) {
			return null;
		}

		const link = showClassicLink
			? site.options.admin_url + 'nav-menus.php'
			: '/menus/' + site.slug;

		return (
			<SidebarItem
				tipTarget="menus"
				label={ translate( 'Menus' ) }
				className="menus"
				link={ link }
				onNavigate={ this.onNavigate }
				icon="menus"
				preloadSectionName="menus"
				selected={ this.isItemLinkSelected( '/menus' ) }
			/>
		);
	}

	render() {
		if ( ! this.props.userCanCustomize ) {
			return null;
		}

		return (
			<SidebarMenu>
				<SidebarHeading>{ this.props.translate( 'Personalize' ) }</SidebarHeading>
				<ul>
					{ this.renderThemesOption() }
					{ this.renderMenusOption() }
				</ul>
			</SidebarMenu>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSite( state );
	const userCanCustomize = canCurrentUser( state, site.ID, 'edit_theme_options' );

	return {
		site,
		userCanCustomize
	};
}

export default connect( mapStateToProps )( localize( AppearanceMenu ) );
