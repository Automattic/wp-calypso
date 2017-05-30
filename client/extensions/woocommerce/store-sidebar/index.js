/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSiteIdWithFallback } from '../state/sites/selectors';
import Sidebar from 'layout/sidebar';
import SidebarButton from 'layout/sidebar/button';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarSeparator from 'layout/sidebar/separator';
import StoreGroundControl from './store-ground-control';

class StoreSidebar extends Component {
	static propTypes = {
		path: PropTypes.string.isRequired,
		sidebarItems: PropTypes.arrayOf( PropTypes.shape( {
			icon: PropTypes.string.isRequired,
			isPrimary: PropTypes.bool.isRequired,
			label: PropTypes.string.isRequired,
			path: PropTypes.string.isRequired,
			slug: PropTypes.string.isRequired,
		} ) ),
		sidebarItemButtons: PropTypes.arrayOf( PropTypes.shape( {
			label: PropTypes.string.isRequired,
			parentSlug: PropTypes.string.isRequired,
			path: PropTypes.string.isRequired,
			slug: PropTypes.string.isRequired,
		} ) ),
		site: PropTypes.object,
	}

	onNavigate = () => {
		window.scrollTo( 0, 0 );
	}

	itemLink = ( path ) => {
		const link = this.props.site ? path.replace( ':site', this.props.site.slug ) : '#';
		return link;
	}

	itemLinkClass = ( path, existingClasses, disabled ) => {
		const classSet = {};

		if ( typeof existingClasses !== 'undefined' ) {
			if ( ! Array.isArray( existingClasses ) ) {
				existingClasses = [ existingClasses ];
			}

			existingClasses.forEach( function( className ) {
				classSet[ className ] = true;
			} );
		}

		if ( disabled ) {
			classSet[ 'is-placeholder' ] = true;
		}

		classSet.selected = this.isItemLinkSelected( path );

		return classNames( classSet );
	}

	isItemLinkSelected = ( paths ) => {
		if ( ! Array.isArray( paths ) ) {
			paths = [ paths ];
		}

		return paths.some( function( path ) {
			return path === this.props.path || 0 === this.props.path.indexOf( path + '/' );
		}, this );
	}

	renderSidebarMenuItems = ( items, buttons, disabled ) => {
		return items.map( function( item, index ) {
			const itemLink = this.itemLink( item.path );
			const itemButton = buttons.filter( button => button.parentSlug === item.slug ).map( button => {
				return (
					<SidebarButton href={ this.itemLink( button.path ) } key={ button.slug } disabled={ disabled } >
						{ button.label }
					</SidebarButton>
				);
			} );
			return (
				<SidebarItem
					className={ this.itemLinkClass( itemLink, item.slug, disabled ) }
					icon={ item.icon }
					key={ index }
					label={ item.label }
					link={ itemLink }
					onNavigate={ this.onNavigate }
					preloadSectionName={ item.slug }
				>
				{ itemButton }
				</SidebarItem>
			);
		}, this );
	}

	render = () => {
		const { sidebarItems, sidebarItemButtons, site } = this.props;

		return (
			<Sidebar className="store-sidebar__sidebar">
				<StoreGroundControl site={ site } />
				<SidebarMenu>
					<ul>
						{ this.renderSidebarMenuItems( sidebarItems.filter( item => item.isPrimary ), sidebarItemButtons, ! site ) }
						<SidebarSeparator />
						{ this.renderSidebarMenuItems( sidebarItems.filter( item => ! item.isPrimary ), sidebarItemButtons, ! site ) }
					</ul>
				</SidebarMenu>
			</Sidebar>
		);
	}
}

function mapStateToProps( state ) {
	return {
		site: getSelectedSiteIdWithFallback( state )
	};
}

export default connect( mapStateToProps )( StoreSidebar );
