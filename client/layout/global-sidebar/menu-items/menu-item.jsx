import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import React, { useRef, forwardRef, Fragment } from 'react';

const SidebarMenuItem = forwardRef(
	(
		{
			url,
			tipTarget,
			onClick,
			tooltip,
			icon,
			className,
			isActive,
			preloadSection,
			hasUnseen,
			children,
			alwaysShowContent,
			disabled,
		},
		ref
	) => {
		const preloadedRef = useRef( false );

		const preload = () => {
			if ( ! preloadedRef.current && preloadSection ) {
				preloadedRef.current = true;
				preloadSection();
			}
		};

		const renderChildren = () => {
			return (
				<Fragment>
					{ icon && ( typeof icon !== 'string' ? icon : <Gridicon icon={ icon } size={ 24 } /> ) }
					{ children && <span className="sidebar__item-content">{ children }</span> }
				</Fragment>
			);
		};

		const itemClasses = classNames( 'sidebar__item', className, {
			'is-active': isActive,
			'has-unseen': hasUnseen,
			'sidebar__item--always-show-content': alwaysShowContent,
			'tooltip tooltip-bottom': tooltip,
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
