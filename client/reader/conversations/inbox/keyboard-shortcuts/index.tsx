import {
	Button,
	Dropdown,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { keyboard } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

interface Props {
	isOpen: boolean;
	onToggle: ( isOpen: boolean ) => void;
}

export function KeyboardShortcuts( { isOpen, onToggle }: Props ) {
	const translate = useTranslate();

	const shortcuts = [
		{ keys: [ '←', 'k' ], label: translate( 'Previous' ) },
		{ keys: [ '→', 'j' ], label: translate( 'Next' ) },
		{ keys: [ 'a' ], label: translate( 'View all' ) },
		{ keys: [ 'u' ], label: translate( 'View unread' ) },
		{ keys: [ 'c' ], label: translate( 'View your comments' ) },
		{ keys: [ 'i' ], label: translate( 'Toggle shortcuts menu' ) },
	];

	return (
		<Dropdown
			open={ isOpen }
			onToggle={ onToggle }
			popoverProps={ { placement: 'bottom-end' } }
			renderToggle={ ( { isOpen: open, onToggle: toggle } ) => (
				<Button
					__next40pxDefaultSize
					icon={ keyboard }
					label={ translate( 'Keyboard shortcuts' ) }
					aria-expanded={ open }
					onClick={ toggle }
				/>
			) }
			renderContent={ () => (
				<VStack as="ul" spacing={ 3 } className="conversations-inbox__shortcuts">
					{ shortcuts.map( ( { keys, label } ) => (
						<HStack as="li" key={ label } spacing={ 3 } justify="flex-start">
							<HStack as="span" spacing={ 1 } expanded={ false }>
								{ keys.map( ( key ) => (
									<kbd key={ key }>{ key }</kbd>
								) ) }
							</HStack>
							<Text>{ label }</Text>
						</HStack>
					) ) }
				</VStack>
			) }
		/>
	);
}
