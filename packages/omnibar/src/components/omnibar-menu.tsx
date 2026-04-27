import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { OmnibarNodeContent } from './omnibar-node';
import type { OmnibarNode } from '../types';

function OmnibarDropdownContent( { nodes }: { nodes: OmnibarNode[] } ) {
	const handleClick = ( href?: string ) => () => {
		if ( href ) {
			window.location.href = href;
		}
	};

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
				<MenuGroup>
					{ ungroupedItems.map( ( item ) => (
						<MenuItem key={ item.id } onClick={ handleClick( item.href ) }>
							<OmnibarNodeContent node={ item } />
						</MenuItem>
					) ) }
				</MenuGroup>
			) }
			{ groups.map( ( group ) => (
				<MenuGroup key={ group.id } label={ group.title }>
					{ ( group.children || [] ).map( ( item ) => (
						<MenuItem key={ item.id } onClick={ handleClick( item.href ) }>
							<OmnibarNodeContent node={ item } />
						</MenuItem>
					) ) }
				</MenuGroup>
			) ) }
		</>
	);
}

export function OmnibarMenu( { node }: { node: OmnibarNode } ) {
	if ( ! node.children ) {
		return (
			<Button className="omnibar__menu" href={ node.href } label={ node.title }>
				<OmnibarNodeContent node={ node } />
			</Button>
		);
	}

	return (
		<DropdownMenu
			className="omnibar__dropdown"
			icon={ null }
			label={ node.title }
			popoverProps={ { className: 'omnibar__popover' } }
			toggleProps={ {
				className: 'omnibar__menu',
				children: <OmnibarNodeContent node={ node } />,
			} }
		>
			{ () => <OmnibarDropdownContent nodes={ node.children ?? [] } /> }
		</DropdownMenu>
	);
}
