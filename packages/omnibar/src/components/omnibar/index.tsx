import {
	__experimentalHStack as HStack,
	DropdownMenu,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';
import type { OmnibarNode, OmnibarProps } from '../../types';

import './index.scss';

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

function OmnibarItem( { node, content }: { node: OmnibarNode; content: React.ReactNode } ) {
	if ( ! node.children ) {
		return null;
	}

	return (
		<DropdownMenu
			className="omnibar__dropdown"
			icon={ null }
			label={ node.title }
			toggleProps={ {
				className: 'omnibar__item',
				children: content,
			} }
		>
			{ () => <OmnibarDropdownContent children={ node.children || [] } /> }
		</DropdownMenu>
	);
}

export function Omnibar( { nodes }: OmnibarProps ) {
	const renderHomeNode = () => {
		const node = nodes.home;
		return node && <OmnibarItem node={ node } content={ node.icon } />;
	};

	const renderSiteNode = () => {
		const node = nodes.site;
		return (
			node && (
				<OmnibarItem
					node={ node }
					content={
						<HStack>
							{ node.icon }
							<span>{ node.title }</span>
						</HStack>
					}
				/>
			)
		);
	};

	const renderUserNode = () => {
		const node = nodes.user;
		return node && <OmnibarItem node={ node } content={ node.title } />;
	};

	return (
		<div className="omnibar" role="navigation" aria-label="Toolbar">
			{ renderHomeNode() }
			{ renderSiteNode() }
			<div className="omnibar__secondary">{ renderUserNode() }</div>
		</div>
	);
}
