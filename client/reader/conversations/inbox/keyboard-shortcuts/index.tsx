import {
	Button,
	Dropdown,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { keyboard } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { SHORTCUTS_POPOVER_CLASS } from './use-inbox-keyboard-shortcuts';

import './style.scss';

interface Props {
	isOpen: boolean;
	onToggle: ( isOpen: boolean ) => void;
}

export function KeyboardShortcuts( { isOpen, onToggle }: Props ) {
	const translate = useTranslate();

	const shortcuts = [
		{ key: '↓', label: translate( 'Next' ) },
		{ key: '↑', label: translate( 'Previous' ) },
		{ key: '←', label: translate( 'Previous tab' ) },
		{ key: '→', label: translate( 'Next tab' ) },
		{ key: 'a', label: translate( 'View all' ) },
		{ key: 'u', label: translate( 'View unread' ) },
		{ key: 'c', label: translate( 'View your comments' ) },
		{ key: 'i', label: translate( 'Toggle shortcuts menu' ) },
	];

	return (
		<Dropdown
			open={ isOpen }
			onToggle={ onToggle }
			popoverProps={ { placement: 'bottom-end' } }
			contentClassName={ SHORTCUTS_POPOVER_CLASS }
			className="conversations-inbox__shortcuts-dropdown"
			renderToggle={ ( { isOpen: open, onToggle: toggle } ) => (
				<Button
					__next40pxDefaultSize
					icon={ keyboard }
					label={ translate( 'Keyboard shortcuts' ) }
					aria-expanded={ open }
					onClick={ toggle }
					size="small"
				/>
			) }
			renderContent={ () => (
				<VStack as="ul" spacing={ 4 } className="conversations-inbox__shortcuts">
					{ shortcuts.map( ( { key, label } ) => (
						<HStack as="li" key={ key } spacing={ 2.5 } justify="flex-start">
							<kbd>{ key }</kbd>
							<Text className="conversations-inbox__shortcuts-label">{ label }</Text>
						</HStack>
					) ) }
				</VStack>
			) }
		/>
	);
}
