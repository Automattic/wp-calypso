import classNames from 'classnames';
import React, { useRef, forwardRef, Fragment } from 'react';
import { useSelector } from 'react-redux';
import { useCurrentRoute } from 'calypso/components/route';
import { getShouldShowGlobalSiteSidebar } from 'calypso/state/global-sidebar/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const SidebarMenuItem = forwardRef(
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
		const { currentSection } = useCurrentRoute();
		const isSidebarCollapsed = useSelector( ( state ) => {
			return getShouldShowGlobalSiteSidebar(
				state,
				selectedSiteId,
				currentSection?.group,
				currentSection?.name
			);
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

		const itemClasses = classNames( 'sidebar__item', className, {
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
			<a { ...attributes } href={ url } ref={ ref }>
				{ renderChildren() }
			</a>
		) : (
			<button { ...attributes } ref={ ref }>
				{ renderChildren() }
			</button>
		);
	}
);

export default SidebarMenuItem;
