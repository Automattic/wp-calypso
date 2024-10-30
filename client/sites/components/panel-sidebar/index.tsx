import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { navigate } from 'calypso/lib/navigate';
import type { Context as PageJSContext } from '@automattic/calypso-router';

import './style.scss';

interface PanelSidebarItem {
	key: string;
	label: string;
	enabled?: ( state: unknown ) => boolean;
}

interface PanelSidebarProps {
	items: PanelSidebarItem[];
	selectedItemKey: string;
	context: PageJSContext;
}

function PanelSidebar( { items, selectedItemKey, context }: PanelSidebarProps ) {
	const switchItem = ( key: string ) => {
		navigate( window.location.pathname.replace( /\/[^/]+\/([^/]+)$/, `/${ key }/$1` ) );
	};

	return (
		<div className="panel-sidebar">
			{ items.map( ( item ) => {
				if ( item.enabled && ! item.enabled( context.store.getState() ) ) {
					return null;
				}

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
	return ( { selectedItemKey, context }: { selectedItemKey: string; context: PageJSContext } ) => (
		<PanelSidebar { ...props } selectedItemKey={ selectedItemKey } context={ context } />
	);
}
