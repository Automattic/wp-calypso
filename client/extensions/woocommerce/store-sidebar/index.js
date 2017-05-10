/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Sidebar from 'layout/sidebar';
import SidebarButton from 'layout/sidebar/button';
import SidebarItem from 'layout/sidebar/item';
import SidebarMenu from 'layout/sidebar/menu';
import SidebarSeparator from 'layout/sidebar/separator';
import StoreGroundControl from './store-ground-control';

export default class StoreSidebar extends Component {
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
		const link = path.replace( ':site', this.props.site.slug );
		return link;
	}

	itemLinkClass = ( path, existingClasses ) => {
		const classSet = {};

		if ( typeof existingClasses !== 'undefined' ) {
			if ( ! Array.isArray( existingClasses ) ) {
				existingClasses = [ existingClasses ];
			}

			existingClasses.forEach( function( className ) {
				classSet[ className ] = true;
			} );
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

	renderSidebarMenuItems = ( items, buttons ) => {
		return items.map( function( item, index ) {
			const itemLink = this.itemLink( item.path );
			return (
				<SidebarItem
					className={ this.itemLinkClass( itemLink, item.slug ) }
					icon={ item.icon }
					key={ index }
					label={ item.label }
					link={ itemLink }
					onNavigate={ this.onNavigate }
					preloadSectionName={ item.slug }
				>
				{
					buttons.filter( button => button.parentSlug === item.slug ).map( button => {
						return (
							<SidebarButton href={ this.itemLink( button.path ) } key={ button.slug } >
								{ button.label }
							</SidebarButton>
						);
					} )
				}
				</SidebarItem>
			);
		}, this );
	}

	render = () => {
		const { sidebarItems, sidebarItemButtons, site } = this.props;

		// The store sidebar only makes sense in the context of a site
		if ( ! site ) {
			return null;
		}

		return (
			<Sidebar className="store-sidebar__sidebar">
				<StoreGroundControl site={ site } />
				<SidebarMenu>
					<ul>
						{ this.renderSidebarMenuItems( sidebarItems.filter( item => item.isPrimary ), sidebarItemButtons ) }
						<SidebarSeparator />
						{ this.renderSidebarMenuItems( sidebarItems.filter( item => ! item.isPrimary ), sidebarItemButtons ) }
					</ul>
				</SidebarMenu>
			</Sidebar>
		);
	}
}
