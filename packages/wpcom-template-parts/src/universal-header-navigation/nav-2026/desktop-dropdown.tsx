import clsx from 'clsx';
import React from 'react';
import { ClickableItem } from '../menu-items';
import { Nav2026ItemContent } from './item-content';
import type { Nav2026Group, Nav2026Menu } from './types';

// Groups sharing a `columnGroup` key stack in one column; the rest get their own.
// `columnIndex` sets the desktop column order; the array order stays the mobile list order.
function toColumns( groups: Nav2026Group[] ): Nav2026Group[][] {
	const columns: Nav2026Group[][] = [];
	const byKey = new Map< string, Nav2026Group[] >();

	for ( const group of groups ) {
		const existing = group.columnGroup ? byKey.get( group.columnGroup ) : undefined;
		if ( existing ) {
			existing.push( group );
			continue;
		}
		const column = [ group ];
		columns.push( column );
		if ( group.columnGroup ) {
			byKey.set( group.columnGroup, column );
		}
	}

	// Explicit index wins; columns without one sort after the indexed ones and
	// keep their array order (stable sort).
	return columns.sort( ( a, b ) => {
		const aIndex = a[ 0 ].columnIndex ?? Number.MAX_SAFE_INTEGER;
		const bIndex = b[ 0 ].columnIndex ?? Number.MAX_SAFE_INTEGER;
		return aIndex - bIndex;
	} );
}

interface Nav2026DesktopDropdownProps {
	dropdownRef: React.RefObject< HTMLDivElement | null >;
	activeDropdown: string | null;
	nav2026Menus: Nav2026Menu[];
	onMouseEnter?: React.MouseEventHandler< HTMLDivElement >;
	onMouseLeave?: React.MouseEventHandler< HTMLDivElement >;
}

// One persistent panel; the active menu cross-fades in so switching never blanks it.
export function Nav2026DesktopDropdown( {
	dropdownRef,
	activeDropdown,
	nav2026Menus,
	onMouseEnter,
	onMouseLeave,
}: Nav2026DesktopDropdownProps ) {
	return (
		<div
			ref={ dropdownRef }
			className={ clsx( 'x-dropdown x-dropdown--2026', {
				'is-dropdown-open': activeDropdown !== null,
			} ) }
			onMouseEnter={ onMouseEnter }
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
							{ toColumns( menu.groups ).map( ( column, columnIndex ) => (
								<div className="x-dropdown-column-group" key={ column[ 0 ].title }>
									{ column.map( ( group, rowIndex ) => (
										<div
											className="x-dropdown-subcategory"
											key={ group.title }
											style={
												{
													'--column-index': columnIndex + 1,
													'--row-index': rowIndex + 1,
												} as React.CSSProperties
											}
										>
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
															<Nav2026ItemContent
																item={ item }
																badgeClassName="x-dropdown-badge-new"
															/>
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
							) ) }
						</div>
					</div>
				);
			} ) }
		</div>
	);
}
