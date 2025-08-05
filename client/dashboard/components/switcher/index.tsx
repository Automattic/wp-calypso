import { Dropdown, Button } from '@wordpress/components';
import { chevronDownSmall } from '@wordpress/icons';
import SwitcherContent from './switcher-content';
import type { PropsWithChildren, ReactNode } from 'react';

export default function Switcher< T >( {
	items,
	value,
	children,
	getItemName,
	getItemUrl,
	renderItemIcon,
}: PropsWithChildren< {
	items?: T[];
	value: T;
	getItemName: ( item: T ) => string;
	getItemUrl: ( item: T ) => string;
	renderItemIcon: ( { item, size }: { item: T; size: number } ) => ReactNode;
} > ) {
	return (
		<Dropdown
			renderToggle={ ( { onToggle } ) => (
				<Button
					className="dashboard-menu__item active"
					icon={ chevronDownSmall }
					iconPosition="right"
					onClick={ () => onToggle() }
				>
					<div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
						{ renderItemIcon( { item: value, size: 16 } ) } { getItemName( value ) }
					</div>
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<SwitcherContent
					items={ items }
					getItemName={ getItemName }
					getItemUrl={ getItemUrl }
					renderItemIcon={ renderItemIcon }
					onClose={ onClose }
				>
					{ children }
				</SwitcherContent>
			) }
		/>
	);
}
