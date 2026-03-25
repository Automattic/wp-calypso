import { Dropdown, Button, ScrollLock } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { chevronDownSmall } from '@wordpress/icons';
import { useState, type ComponentProps } from 'react';
import SwitcherContent from './switcher-content';
import SwitcherItem from './switcher-item';
import { RenderItem } from './types';
import type { Field, View } from '@wordpress/dataviews';

interface RenderCallbackProps {
	onClose: () => void;
}

type RenderToggle = ComponentProps< typeof Dropdown >[ 'renderToggle' ];

export type SwitcherProps< T > = {
	items?: T[];
	value: T;
	searchableFields: Field< T >[];
	children?: ( props: RenderCallbackProps ) => React.ReactNode;
	getItemUrl: ( item: T ) => string;
	renderItem: RenderItem< T >;
	icon?: React.JSX.Element;
	onItemClick?: () => void;
	renderToggle?: RenderToggle;
} & Pick< ComponentProps< typeof Dropdown >, 'open' | 'onToggle' | 'defaultOpen' >;

const DEFAULT_VIEW: View = {
	type: 'list',
	page: 1,
	perPage: 10,
	sort: { field: 'name', direction: 'asc' },
};

function Switcher< T >( {
	items,
	value,
	searchableFields,
	children,
	getItemUrl,
	renderItem,
	icon = chevronDownSmall,
	onItemClick,
	open,
	onToggle,
	defaultOpen,
	renderToggle,
}: SwitcherProps< T > ) {
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	const isDesktop = useViewportMatch( 'medium' );
	const renderDropdownToggle: RenderToggle = ( { isOpen, onToggle, ...props } ) => {
		if ( renderToggle ) {
			return renderToggle( { isOpen, onToggle, ...props } );
		}

		return (
			<Button
				className="dashboard-menu__item active"
				icon={ icon }
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
				style={ {
					width: '100%',
					justifyContent: 'flex-start',
					overflow: 'hidden',
					maxWidth: isDesktop ? 'calc(30vw)' : '100%',
				} }
			>
				{ renderItem( { item: value, context: 'dropdown' } ) }
			</Button>
		);
	};

	return (
		<Dropdown
			open={ open }
			onToggle={ onToggle }
			defaultOpen={ defaultOpen }
			renderToggle={ renderDropdownToggle }
			renderContent={ ( { onClose } ) => (
				<>
					<ScrollLock />
					<SwitcherContent
						items={ items }
						searchableFields={ searchableFields }
						getItemUrl={ getItemUrl }
						renderItem={ renderItem }
						view={ view }
						onChangeView={ setView }
						onClose={ onClose }
						onItemClick={ onItemClick }
					>
						{ children?.( { onClose } ) }
					</SwitcherContent>
				</>
			) }
		/>
	);
}

Switcher.Item = SwitcherItem;

export default Switcher;
