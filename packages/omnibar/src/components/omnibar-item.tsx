import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import type { OmnibarNode } from '../types';

function OmnibarDropdownContent( { children }: { children: OmnibarNode[] } ) {
	const handleClick = ( href?: string ) => () => {
		if ( href ) {
			window.location.href = href;
		}
	};

	const ungroupedItems: OmnibarNode[] = [];
	const groups: OmnibarNode[] = [];

	for ( const child of children ) {
		if ( child.group ) {
			groups.push( child );
		} else {
			ungroupedItems.push( child );
		}
	}

	return (
		<>
			{ ungroupedItems.length > 0 && (
				<MenuGroup>
					{ ungroupedItems.map( ( item ) => (
						<MenuItem key={ item.id } onClick={ handleClick( item.href ) }>
							{ item.title }
						</MenuItem>
					) ) }
				</MenuGroup>
			) }
			{ groups.map( ( group ) => (
				<MenuGroup key={ group.id } label={ group.title }>
					{ ( group.children || [] ).map( ( item ) => (
						<MenuItem key={ item.id } onClick={ handleClick( item.href ) }>
							{ item.title }
						</MenuItem>
					) ) }
				</MenuGroup>
			) ) }
		</>
	);
}

export function OmnibarItem( { node, content }: { node: OmnibarNode; content: React.ReactNode } ) {
	if ( ! node.children ) {
		return (
			<Button className="omnibar__item" href={ node.href } label={ node.title }>
				{ content }
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
				className: 'omnibar__item',
				children: content,
			} }
		>
			{ () => <OmnibarDropdownContent children={ node.children || [] } /> }
		</DropdownMenu>
	);
}
