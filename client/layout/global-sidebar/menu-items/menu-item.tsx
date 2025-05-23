import clsx from 'clsx';
import React, { useRef, forwardRef, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentRoute } from 'calypso/components/route';
import { getShouldShowCollapsedGlobalSidebar } from 'calypso/state/global-sidebar/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { ReactNode, LegacyRef } from 'react';

interface Props {
	url?: string;
	tipTarget?: string;
	onClick: () => void;
	tooltip?: string;
	tooltipPlacement?: 'bottom' | 'top' | 'right';
	icon?: ReactNode;
	className: string;
	isActive?: boolean;
	preloadSection?: () => void;
	hasUnseen?: boolean;
	alwaysShowContent?: boolean;
	disabled?: boolean;
}

const SidebarMenuItem = forwardRef< HTMLButtonElement | HTMLAnchorElement, Props >(
	(
		{
			url,
			tipTarget,
			onClick,
			tooltip,
			tooltipPlacement = 'bottom',
			icon,
			className,
			isActive,
			preloadSection,
			hasUnseen,
			alwaysShowContent,
			disabled,
		},
		ref
	) => {
		const preloadedRef = useRef( false );

		const selectedSiteId = useSelector( getSelectedSiteId );
		const { currentSection, currentRoute } = useCurrentRoute() as {
			currentSection: false | { group?: string; name?: string };
			currentRoute: string;
		};
		const isSidebarCollapsed = useSelector( ( state ) => {
			return getShouldShowCollapsedGlobalSidebar( {
				state,
				siteId: selectedSiteId,
				section: currentSection as { group?: string },
				route: currentRoute,
			} );
		} );

		const preload = () => {
			if ( ! preloadedRef.current && preloadSection ) {
				preloadedRef.current = true;
				preloadSection();
			}
		};

		const renderChildren = () => {
			return <Fragment>{ icon && <>{ icon }</> }</Fragment>;
		};

		const itemClasses = clsx( 'sidebar__item', className, {
			'is-active': isActive,
			'has-unseen': hasUnseen,
			'sidebar__item--always-show-content': alwaysShowContent,
			[ `tooltip tooltip-${ isSidebarCollapsed ? 'right' : tooltipPlacement }` ]: tooltip,
		} );

		const attributes = {
			'data-tooltip': tooltip,
			'data-tip-target': tipTarget,
			onClick: onClick,
			className: itemClasses,
			onTouchStart: preload,
			onMouseEnter: preload,
			disabled: disabled,
		};

		return url ? (
			<a { ...attributes } href={ url } ref={ ref as LegacyRef< HTMLAnchorElement > }>
				{ renderChildren() }
			</a>
		) : (
			<button { ...attributes } ref={ ref as LegacyRef< HTMLButtonElement > }>
				{ renderChildren() }
			</button>
		);
	}
);

export default SidebarMenuItem;
