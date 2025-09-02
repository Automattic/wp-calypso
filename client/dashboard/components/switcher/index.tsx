import { Dropdown, Button } from '@wordpress/components';
import { chevronDownSmall } from '@wordpress/icons';
import SwitcherContent, { type RenderItemIcon } from './switcher-content';

interface RenderCallbackProps {
	onClose: () => void;
}

export default function Switcher< T >( {
	items,
	value,
	children,
	getItemName,
	getItemUrl,
	renderItemIcon,
}: {
	items?: T[];
	value: T;
	children?: ( props: RenderCallbackProps ) => React.ReactNode;
	getItemName: ( item: T ) => string;
	getItemUrl: ( item: T ) => string;
	renderItemIcon: RenderItemIcon< T >;
} ) {
	return (
		<Dropdown
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
