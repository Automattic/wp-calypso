/**
 * External dependencies
 */
import classNames from 'classnames';
import debugFactory from 'debug';
import React, { Component, PropTypes } from 'react';

const debug = debugFactory( 'calypso:store-sidebar' );

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
		sidebarItems: PropTypes.array, // TODO enforce shape
		sidebarItemButtons: PropTypes.array, // TODO enforce shape
		site: PropTypes.object, // TODO enforce slug in shape
	}

	onNavigate = () => {
		// TODO - this.props.setNextLayoutFocus( 'content' );
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

	onBack = () => {
		// TODO - decide what path should go in on back
		// Probably stats/day/:site
	}

	render = () => {
		const { path, sidebarItems, sidebarItemButtons, site } = this.props;
		debug( 'rendering store sidebar for path:', path );

		// The store sidebar only makes sense in the context of a site
		if ( ! site ) {
			debug( 'attempted to render store sidebar outside of site context' );
			return null;
		}

		return (
			<Sidebar className="store-sidebar__sidebar">
				<StoreGroundControl onBack={ this.onBack } site={ site } />
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

// TODO mapStateToProps
// TODO connect setNextLayoutFocus and SetLayoutFocus
