import clsx from 'clsx';
import React from 'react';
import { ClickableItem } from '../menu-items';
import type { Nav2026Menu } from './types';

interface Nav2026DesktopDropdownProps {
	dropdownRef: React.RefObject< HTMLDivElement >;
	activeDropdown: string | null;
	nav2026Menus: Nav2026Menu[];
	onMouseLeave?: React.MouseEventHandler< HTMLDivElement >;
}

// One persistent panel; the active menu cross-fades in so switching never blanks it.
export function Nav2026DesktopDropdown( {
	dropdownRef,
	activeDropdown,
	nav2026Menus,
	onMouseLeave,
}: Nav2026DesktopDropdownProps ) {
	return (
		<div
			ref={ dropdownRef }
			className={ clsx( 'x-dropdown x-dropdown--2026', {
				'is-dropdown-open': activeDropdown !== null,
			} ) }
			onMouseLeave={ onMouseLeave }
		>
			{ nav2026Menus.map( ( menu ) => {
				if ( ! menu.groups ) {
					return null;
				}
				// Reading-order counter for the slide-in stagger.
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
												content={
													item.badge ? (
														<>
															{ item.label }
															<span className="x-dropdown-badge-new">{ item.badge }</span>
														</>
													) : (
														item.label
													)
												}
												urlValue={ item.url }
												type="dropdown"
												trackingText={ item.label }
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
