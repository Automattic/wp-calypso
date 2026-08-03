import { privateApis } from '@wordpress/components';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { Button } from '@wordpress/ui';
import { useRef, useState } from 'react';
import { OmnibarNodeContent } from './omnibar-node';
import type { OmnibarNode } from '../types';

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

	return (
		<Menu.Item render={ node.href ? <a href={ node.href } /> : undefined }>
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
				<Menu.Group key={ group.id }>
					{ group.title && <Menu.GroupLabel>{ group.title }</Menu.GroupLabel> }
					{ ( group.children || [] ).map( ( item ) => (
						<OmnibarMenuItem key={ item.id } node={ item } />
					) ) }
				</Menu.Group>
			) ) }
		</>
	);
}

export function OmnibarMenu( { node, style }: { node: OmnibarNode; style?: React.CSSProperties } ) {
	const label = node.title || node.label || '';
	const [ isOpen, setIsOpen ] = useState( false );
	const triggerRef = useRef< HTMLElement >( null );
	const popoverRef = useRef< HTMLElement >( null );

	if ( ! node.children ) {
		return (
			<Button
				variant="unstyled"
				className="omnibar__menu"
				style={ style }
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
		const movingTo = event.relatedTarget as Node | null;
		if (
			! triggerRef.current?.contains( movingTo ) &&
			! popoverRef.current?.contains( movingTo )
		) {
			setIsOpen( false );
		}
	};

	return (
		<Menu open={ isOpen } onOpenChange={ setIsOpen }>
			<Menu.TriggerButton
				ref={ triggerRef }
				onMouseEnter={ () => setIsOpen( true ) }
				onMouseLeave={ handleMouseLeave }
				render={
					<Button variant="unstyled" className="omnibar__menu" style={ style } aria-label={ label }>
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
				onMouseLeave={ handleMouseLeave }
			>
				<OmnibarMenuContent nodes={ node.children } />
			</Menu.Popover>
		</Menu>
	);
}
