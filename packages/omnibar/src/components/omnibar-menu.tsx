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
	if ( node.children ) {
		return (
			<Menu>
				<Menu.SubmenuTriggerItem>
					<OmnibarNodeContent node={ node } />
				</Menu.SubmenuTriggerItem>
				<Menu.Popover className="omnibar__popover">
					<OmnibarMenuContent nodes={ node.children } />
				</Menu.Popover>
			</Menu>
		);
	}

	if ( node.interactive === false ) {
		return (
			<div className="omnibar__menu-static-item">
				<OmnibarNodeContent node={ node } />
			</div>
		);
	}

	return (
		<Menu.Item render={ node.href ? <a href={ node.href } /> : undefined } onClick={ node.onClick }>
			<OmnibarNodeContent node={ node } />
		</Menu.Item>
	);
}

function OmnibarMenuContent( { nodes }: { nodes: OmnibarNode[] } ) {
	const ungroupedItems: OmnibarNode[] = [];
	const groups: OmnibarNode[] = [];

	for ( const node of nodes ) {
		if ( node.group ) {
			groups.push( node );
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
	const menuClassName = className ? `omnibar__menu ${ className }` : 'omnibar__menu';
	const [ isOpen, setIsOpen ] = useState( false );
	const triggerRef = useRef< HTMLElement >( null );
	const popoverRef = useRef< HTMLElement >( null );
	const closedByPointerRef = useRef( false );

	if ( ! node.children ) {
		return (
			<Button
				variant="unstyled"
				className={ menuClassName }
				render={ node.href ? <a href={ node.href } /> : undefined }
				nativeButton={ ! node.href }
				onClick={ node.onClick }
				aria-label={ label }
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

	return (
		<Menu open={ isOpen } onOpenChange={ handleOpenChange }>
			<Menu.TriggerButton
				ref={ triggerRef }
				onMouseEnter={ () => setIsOpen( true ) }
				onMouseLeave={ handleMouseLeave }
				aria-expanded={ isOpen }
				render={
					<Button variant="unstyled" className={ menuClassName } aria-label={ label }>
						<OmnibarNodeContent node={ node } />
					</Button>
				}
			/>
			<Menu.Popover
				ref={ popoverRef }
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
