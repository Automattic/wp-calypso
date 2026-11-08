import { Button, Menu } from '@wordpress/ui';
import { useEffect, useRef, useState } from 'react';
import { OmnibarNodeContent } from './omnibar-node';
import type { OmnibarNode } from '../types';

import './omnibar-menu.scss';

function useOnView( onView?: () => void ) {
	const hasViewed = useRef( false );

	useEffect( () => {
		if ( hasViewed.current || ! onView ) {
			return;
		}
		hasViewed.current = true;
		onView();
	}, [ onView ] );
}

function OmnibarMenuItem( { node }: { node: OmnibarNode } ) {
	useOnView( node.onView );

	const label = (
		<Menu.ItemLabel>
			<OmnibarNodeContent node={ node } />
		</Menu.ItemLabel>
	);

	if ( node.children?.length ) {
		return (
			<Menu.SubmenuRoot>
				<Menu.SubmenuTrigger>{ label }</Menu.SubmenuTrigger>
				<Menu.Popup className="omnibar__popover" width="content">
					<OmnibarMenuContent nodes={ node.children } />
				</Menu.Popup>
			</Menu.SubmenuRoot>
		);
	}

	if ( node.disabled ) {
		return (
			<div className="omnibar__menu-static-item">
				<OmnibarNodeContent node={ node } />
			</div>
		);
	}

	if ( node.href ) {
		return (
			<Menu.LinkItem
				href={ node.href }
				target={ node.target }
				rel={ node.rel }
				title={ node.tooltip }
				onClick={ node.onClick }
			>
				{ label }
			</Menu.LinkItem>
		);
	}

	return <Menu.Item onClick={ node.onClick }>{ label }</Menu.Item>;
}

function OmnibarMenuContent( { nodes }: { nodes: OmnibarNode[] } ) {
	const ungroupedItems: OmnibarNode[] = [];
	const groups: OmnibarNode[] = [];

	for ( const node of nodes ) {
		if ( node.group ) {
			if ( node.children?.length ) {
				groups.push( node );
			}
		} else {
			ungroupedItems.push( node );
		}
	}

	return (
		<>
			{ ungroupedItems.length > 0 && (
				<Menu.Group>
					{ ungroupedItems.map( ( item ) => (
						<OmnibarMenuItem key={ item.id } node={ item } />
					) ) }
				</Menu.Group>
			) }
			{ groups.map( ( group ) => (
				<Menu.Group
					key={ group.id }
					className={
						group.variant ? `omnibar__menu-group is-${ group.variant }` : 'omnibar__menu-group'
					}
				>
					{ group.title && <Menu.GroupLabel>{ group.title }</Menu.GroupLabel> }
					{ ( group.children || [] ).map( ( item ) => (
						<OmnibarMenuItem key={ item.id } node={ item } />
					) ) }
				</Menu.Group>
			) ) }
		</>
	);
}

export function OmnibarMenu( { node, className }: { node: OmnibarNode; className?: string } ) {
	useOnView( node.onView );

	const label = node.label || node.title || '';
	const menuClassName = [ 'omnibar__menu', className, node.className, node.active && 'is-active' ]
		.filter( Boolean )
		.join( ' ' );
	const [ isOpen, setIsOpen ] = useState( false );
	const triggerRef = useRef< HTMLButtonElement >( null );
	const closedByPointerRef = useRef( false );
	const openedByKeyboardRef = useRef( false );

	const setPopoverRef = ( element: HTMLElement | null ) => {
		if ( element && openedByKeyboardRef.current ) {
			openedByKeyboardRef.current = false;
			element.querySelector< HTMLElement >( '[role="menuitem"]' )?.focus();
		}
	};

	if ( ! node.children?.length ) {
		const isLink = !! node.href && ! node.disabled;
		return (
			<Button
				variant="unstyled"
				className={ menuClassName }
				render={
					isLink ? <a href={ node.href } target={ node.target } rel={ node.rel } /> : undefined
				}
				nativeButton={ ! isLink }
				disabled={ node.disabled }
				onClick={ node.onClick }
				aria-label={ label }
				title={ node.tooltip }
			>
				<OmnibarNodeContent node={ node } />
			</Button>
		);
	}

	const handleOpenChange: React.ComponentProps< typeof Menu.Root >[ 'onOpenChange' ] = (
		open,
		{ reason }
	) => {
		closedByPointerRef.current = ! open && reason === 'trigger-hover';
		setIsOpen( open );
	};

	const handleTouchEnd = ( event: React.TouchEvent ) => {
		if ( ! node.href ) {
			return;
		}
		event.preventDefault();
		setIsOpen( ( open ) => ! open );
	};

	const handleKeyDown = ( event: React.KeyboardEvent ) => {
		if ( ! node.href || ( event.key !== 'Enter' && event.key !== ' ' ) ) {
			return;
		}
		event.preventDefault();
		openedByKeyboardRef.current = ! isOpen;
		setIsOpen( ( open ) => ! open );
	};

	return (
		<Menu.Root open={ isOpen } onOpenChange={ handleOpenChange } modal={ false }>
			<Menu.Trigger
				ref={ triggerRef }
				onClick={ node.onClick }
				openOnHover
				delay={ 0 }
				onTouchEnd={ handleTouchEnd }
				onKeyDown={ handleKeyDown }
				nativeButton={ ! node.href }
				render={
					<Button
						variant="unstyled"
						className={ menuClassName }
						aria-label={ label }
						title={ node.tooltip }
						render={
							node.href ? (
								<a href={ node.href } target={ node.target } rel={ node.rel } />
							) : undefined
						}
						nativeButton={ ! node.href }
					>
						<OmnibarNodeContent node={ node } />
					</Button>
				}
			/>
			<Menu.Popup
				ref={ setPopoverRef }
				className="omnibar__popover is-root"
				width="content"
				positioner={ <Menu.Positioner align="start" sideOffset={ 0 } collisionPadding={ 0 } /> }
				finalFocus={ () => ! closedByPointerRef.current }
			>
				<OmnibarMenuContent nodes={ node.children } />
			</Menu.Popup>
		</Menu.Root>
	);
}
