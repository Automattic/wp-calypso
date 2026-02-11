import {
	__experimentalHStack as HStack,
	Dropdown,
	Button,
	ScrollLock,
} from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { chevronDownSmall } from '@wordpress/icons';
import { useState, type ComponentProps } from 'react';
import { createPortal } from 'react-dom';
import SwitcherContent from './switcher-content';
import { RenderItemTitle, RenderItemMedia, RenderItemDescription } from './types';
import type { Field, View } from '@wordpress/dataviews';

import './style.scss';

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

const DEFAULT_VIEW: View = {
	type: 'list',
	page: 1,
	perPage: 10,
	sort: { field: 'name', direction: 'asc' },
};

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
	const [ view, setView ] = useState< View >( DEFAULT_VIEW );
	// Track open state internally to render overlay. Uses controlled `open` if provided,
	// otherwise falls back to internal state for uncontrolled usage.
	const [ internalIsOpen, setInternalIsOpen ] = useState( defaultOpen ?? false );
	const isOpen = open ?? internalIsOpen;

	const handleToggle = ( willOpen: boolean ) => {
		setInternalIsOpen( willOpen );
		onToggle?.( willOpen );
	};

	const handleOverlayClick = ( event: React.MouseEvent ) => {
		// Prevent click from propagating to elements beneath the overlay
		event.stopPropagation();
		handleToggle( false );
	};

	const isDesktop = useViewportMatch( 'medium' );
	return (
		<>
			{ isOpen &&
				createPortal(
					// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
					<div
						className="dashboard-switcher-overlay"
						data-testid="switcher-overlay"
						onClick={ handleOverlayClick }
					/>,
					document.body
				) }
			<Dropdown
				open={ open }
				onToggle={ handleToggle }
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
		</>
	);
}
