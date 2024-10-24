import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { navigate } from 'calypso/lib/navigate';

import './style.scss';

interface PanelSidebarItem {
	key: string;
	label: string;
}

interface PanelSidebarProps {
	items: PanelSidebarItem[];
	selectedItemKey: string;
}

function PanelSidebar( { items, selectedItemKey }: PanelSidebarProps ) {
	const switchItem = ( key: string ) => {
		navigate( window.location.pathname.replace( /\/[^/]+\/([^/]+)$/, `/${ key }/$1` ) );
	};

	return (
		<div className="panel-sidebar">
			{ items.map( ( item ) => {
				return (
					<Button
						key={ item.key }
						className={ clsx( 'panel-sidebar-tab', {
							'panel-sidebar-tab--active': item.key === selectedItemKey,
						} ) }
						onClick={ () => switchItem( item.key ) }
					>
						{ item.label }
					</Button>
				);
			} ) }
		</div>
	);
}

export function PanelWithSidebar( { children }: { children: React.ReactNode } ) {
	return <div className="panel-with-sidebar">{ children }</div>;
}

export default function makeSidebar( { items }: { items: PanelSidebarItem[] } ) {
	const props = { items };
	return ( { selectedItemKey }: { selectedItemKey: string } ) => (
		<PanelSidebar { ...props } selectedItemKey={ selectedItemKey } />
	);
}
