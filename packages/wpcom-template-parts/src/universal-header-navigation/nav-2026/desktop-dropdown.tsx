import clsx from 'clsx';
import React from 'react';
import { ClickableItem } from '../menu-items';
import type { Nav2026Menu } from './types';

interface Nav2026DesktopDropdownProps {
	dropdownRef: React.RefObject< HTMLDivElement >;
	activeDropdown: string | null;
	nav2026Menus: Nav2026Menu[];
}

// 2026 desktop dropdown — ONE persistent panel holding all menus' content
// stacked; the active one (activeDropdown) cross-fades in while the others fade out,
// so switching triggers never blanks the panel. Hovering the panel keeps it
// open; leaving the nav area closes it.
export function Nav2026DesktopDropdown( {
	dropdownRef,
	activeDropdown,
	nav2026Menus,
}: Nav2026DesktopDropdownProps ) {
	return (
		<div
			ref={ dropdownRef }
			className={ clsx( 'x-dropdown x-dropdown--2026', {
				'is-dropdown-open': activeDropdown !== null,
			} ) }
		>
			{ nav2026Menus.map( ( menu ) => {
				if ( ! menu.groups ) {
					return null;
				}
				// Reading-order counter for the slide-in stagger (title, then its links, …).
				let staggerIndex = 0;
				return (
					<div
						className="x-dropdown-content x-dropdown--2026"
						data-dropdown-name={ menu.name }
						id={ `x-dropdown-2026-${ menu.name }` }
						role="menu"
						aria-label={ menu.title }
						aria-hidden={ activeDropdown !== menu.name }
						key={ menu.name }
					>
						<div className="x-dropdown-subcategories">
							{ menu.groups.map( ( group ) => (
								<div className="x-dropdown-column-group" key={ group.title }>
									<h4
										className="x-dropdown-subcategory-title"
										role="presentation"
										style={ { '--stagger-index': staggerIndex++ } as React.CSSProperties }
									>
										{ group.title }
									</h4>
									<ul>
										{ group.items.map( ( item ) => (
											<ClickableItem
												key={ item.url }
												index={ staggerIndex++ }
												titleValue=""
												content={ item.label }
												urlValue={ item.url }
												type="dropdown"
												target={ item.target }
												tabIndex={ activeDropdown === menu.name ? undefined : -1 }
											/>
										) ) }
									</ul>
								</div>
							) ) }
						</div>
					</div>
				);
			} ) }
		</div>
	);
}
