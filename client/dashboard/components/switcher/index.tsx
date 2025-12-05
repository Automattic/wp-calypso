import {
	__experimentalHStack as HStack,
	Dropdown,
	Button,
	ScrollLock,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { chevronDownSmall } from '@wordpress/icons';
import SwitcherContent from './switcher-content';
import { RenderItemTitle, RenderItemMedia, RenderItemDescription } from './types';
import type { Field } from '@wordpress/dataviews';
import type { ComponentProps } from 'react';

interface RenderCallbackProps {
	onClose: () => void;
}

export type SwitcherProps< T > = {
	items?: T[];
	value: T;
	searchableFields: Field< T >[];
	children?: ( props: RenderCallbackProps ) => React.ReactNode;
	getItemUrl: ( item: T ) => string;
	renderItemMedia: RenderItemMedia< T >;
	renderItemTitle: RenderItemTitle< T >;
	renderItemDescription?: RenderItemDescription< T >;
	onItemClick?: () => void;
} & Pick< ComponentProps< typeof Dropdown >, 'open' | 'onToggle' | 'defaultOpen' >; // For controlled usage of the switcher

export default function Switcher< T >( {
	items,
	value,
	searchableFields,
	children,
	getItemUrl,
	renderItemMedia,
	renderItemTitle,
	renderItemDescription,
	onItemClick,
	open,
	onToggle,
	defaultOpen,
}: SwitcherProps< T > ) {
	const isDesktop = useViewportMatch( 'medium' );
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
					style={ { width: '100%', justifyContent: 'flex-start' } }
				>
					<HStack
						alignment="center"
						style={ { overflow: 'hidden', maxWidth: isDesktop ? 'calc(30vw)' : '100%' } }
					>
						{ renderItemMedia( { item: value, context: 'dropdown', size: 16 } ) }
						{ renderItemTitle( { item: value, context: 'dropdown' } ) }
					</HStack>
				</Button>
			) }
			renderContent={ ( { onClose } ) => (
				<>
					<ScrollLock />
					<SwitcherContent
						items={ items }
						searchableFields={ searchableFields }
						getItemUrl={ getItemUrl }
						renderItemMedia={ renderItemMedia }
						renderItemTitle={ renderItemTitle }
						renderItemDescription={ renderItemDescription }
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
