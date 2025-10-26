import { Dropdown, Button } from '@wordpress/components';
import { chevronDownSmall } from '@wordpress/icons';
import SwitcherContent, { type RenderItemIcon } from './switcher-content';
import type { Field } from '@wordpress/dataviews';
import type { ComponentProps } from 'react';

interface RenderCallbackProps {
	onClose: () => void;
}

type SwitcherProps< T > = {
	items?: T[];
	value: T;
	searchableFields?: Field< T >[];
	children?: ( props: RenderCallbackProps ) => React.ReactNode;
	getItemName: ( item: T ) => string;
	getItemUrl: ( item: T ) => string;
	renderItemIcon: RenderItemIcon< T >;
} & Pick< ComponentProps< typeof Dropdown >, 'open' | 'onToggle' | 'defaultOpen' >; // For controlled usage of the switcher

export default function Switcher< T >( {
	items,
	value,
	searchableFields,
	children,
	getItemName,
	getItemUrl,
	renderItemIcon,
	open,
	onToggle,
	defaultOpen,
}: SwitcherProps< T > ) {
	return (
		<Dropdown
			open={ open }
			onToggle={ onToggle }
			defaultOpen={ defaultOpen }
			renderToggle={ ( { onToggle, isOpen } ) => (
				<Button
					className="dashboard-menu__item active"
					icon={ chevronDownSmall }
					iconPosition="right"
					onClick={ () => onToggle() }
					onKeyDown={ ( event: React.KeyboardEvent ) => {
						if ( ! isOpen && event.code === 'ArrowDown' ) {
							event.preventDefault();
							onToggle();
						}
					} }
					aria-haspopup="true"
					aria-expanded={ isOpen }
				>
					<div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
						{ renderItemIcon( { item: value, context: 'dropdown', size: 16 } ) }
						{ getItemName( value ) }
					</div>
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<SwitcherContent
					items={ items }
					searchableFields={ searchableFields }
					getItemName={ getItemName }
					getItemUrl={ getItemUrl }
					renderItemIcon={ renderItemIcon }
					onClose={ onClose }
				>
					{ children?.( { onClose } ) }
				</SwitcherContent>
			) }
		/>
	);
}
