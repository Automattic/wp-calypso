import { privateApis } from '@wordpress/components';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { Button } from '@wordpress/ui';
import { useRef, useState } from 'react';
import { OmnibarNodeContent } from './omnibar-node';
import type { OmnibarNode } from '../types';

import './omnibar-menu.scss';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);
const { Menu } = unlock( privateApis );

function OmnibarMenuItem( { node }: { node: OmnibarNode } ) {
	if ( node.children?.length ) {
		return (
			<Menu>
				<Menu.SubmenuTriggerItem tabbable>
					<OmnibarNodeContent node={ node } />
				</Menu.SubmenuTriggerItem>
				<Menu.Popover className="omnibar__popover">
					<OmnibarMenuContent nodes={ node.children } />
				</Menu.Popover>
			</Menu>
		);
	}

	if ( node.disabled ) {
		return (
			<div className="omnibar__menu-static-item">
				<OmnibarNodeContent node={ node } />
			</div>
		);
	}

	return (
		<Menu.Item
			tabbable
			render={
				node.href ? <a href={ node.href } target={ node.target } rel={ node.rel } /> : undefined
			}
			onClick={ node.onClick }
		>
			<OmnibarNodeContent node={ node } />
		</Menu.Item>
	);
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
	const label = node.title || node.label || '';
	const menuClassName = [ 'omnibar__menu', className, node.className, node.active && 'is-active' ]
		.filter( Boolean )
		.join( ' ' );
	const [ isOpen, setIsOpen ] = useState( false );
	const triggerRef = useRef< HTMLElement >( null );
	const popoverRef = useRef< HTMLElement >( null );
	const closedByPointerRef = useRef( false );
	const openedByKeyboardRef = useRef( false );

	const setPopoverRef = ( element: HTMLElement | null ) => {
		popoverRef.current = element;
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

	const handleMouseLeave = ( event: React.MouseEvent ) => {
		const movingTo = event.relatedTarget instanceof Node ? event.relatedTarget : null;
		if (
			! triggerRef.current?.contains( movingTo ) &&
			! popoverRef.current?.contains( movingTo )
		) {
			closedByPointerRef.current = true;
			setIsOpen( false );
		}
	};

	const handleOpenChange = ( open: boolean ) => {
		if ( open ) {
			closedByPointerRef.current = false;
		}
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
		<Menu open={ isOpen } onOpenChange={ handleOpenChange }>
			<Menu.TriggerButton
				ref={ triggerRef }
				onClick={ node.onClick }
				onMouseEnter={ () => setIsOpen( true ) }
				onMouseLeave={ handleMouseLeave }
				onTouchEnd={ handleTouchEnd }
				onKeyDown={ handleKeyDown }
				aria-expanded={ isOpen }
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
			<Menu.Popover
				ref={ setPopoverRef }
				className="omnibar__popover"
				gutter={ 0 }
				overflowPadding={ 0 }
				modal={ false }
				autoFocusOnHide={ () => ! closedByPointerRef.current }
				onMouseLeave={ handleMouseLeave }
			>
				<OmnibarMenuContent nodes={ node.children } />
			</Menu.Popover>
		</Menu>
	);
}
