/**
 * External dependencies
 */
import classNames from 'classnames';
import { connect } from 'react-redux';
import { find, filter } from 'lodash';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { getSelectedSiteWithFallback } from '../state/sites/selectors';
import { getLink } from '../lib/nav-utils';
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
			icon: PropTypes.string,
			isPrimary: PropTypes.bool.isRequired,
			label: PropTypes.string.isRequired,
			parentSlug: PropTypes.string,
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

	isItemLinkSelected = ( paths ) => {
		if ( ! Array.isArray( paths ) ) {
			paths = [ paths ];
		}

		return paths.some( function( path ) {
			return path === this.props.path || 0 === this.props.path.indexOf( path + '/' );
		}, this );
	}

	renderSidebarMenuItems = ( items, buttons, isDisabled ) => {
		const { site } = this.props;

		return items.map( function( item, index ) {
			const isChild = ( 'undefined' !== typeof item.parentSlug );
			const itemLink = getLink( item.path, site );
			const itemButton = buttons.filter( button => button.parentSlug === item.slug ).map( button => {
				return (
					<SidebarButton
						disabled={ isDisabled }
						href={ getLink( button.path, site ) }
						key={ button.slug }
					>
						{ button.label }
					</SidebarButton>
				);
			} );

			// If this item has a parentSlug, only render it if 1) the parent is
			// currently selected, 2) it is currently selected, or 3) any of its
			// siblings are selected
			if ( 'undefined' !== typeof item.parentSlug ) {
				const links = [];
				const parentItem = find( items, { slug: item.parentSlug } );
				links.push( getLink( parentItem.path, site ) );

				filter( items, { parentSlug: item.parentSlug } ).map( child => {
					links.push( getLink( child.path, site ) );
				} );

				if ( ! this.isItemLinkSelected( links ) ) {
					return null;
				}
			}

			// If we reach this point, this is not a child item
			// lets see if its children, if any, are selected
			const childLinks = [];
			filter( items, { parentSlug: item.slug } ).map( child => {
				childLinks.push( getLink( child.path, site ) );
			} );

			// Build the classnames for the item
			const itemClasses = classNames( item.slug,
				{
					'has-selected-child': this.isItemLinkSelected( childLinks ),
					'is-child-item': isChild,
					'is-placeholder': isDisabled,
					selected: this.isItemLinkSelected( itemLink ),
				}
			);

			// Render the item
			return (
				<SidebarItem
					className={ itemClasses }
					icon={ isChild ? '' : item.icon }
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
		site: getSelectedSiteWithFallback( state )
	};
}

export default connect( mapStateToProps )( StoreSidebar );
