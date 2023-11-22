import { Modal, TextHighlight, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, search as inputIcon } from '@wordpress/icons';
import { cleanForSlug } from '@wordpress/url';
import classnames from 'classnames';
import { Command, useCommandState } from 'cmdk';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useCommandPallette } from './use-command-pallette';

import '@wordpress/commands/build-style/style.css';

interface CommandMenuGroupProps {
	isContextual?: boolean;
	search: string;
	close: () => void;
	setSearch: ( search: string ) => void;
}

export function CommandMenuGroup( {
	isContextual,
	search,
	close,
	setSearch,
}: CommandMenuGroupProps ) {
	const [ selectedCommandName, setSelectedCommandName ] = useState( '' );
	const { commands: smpDefaultCommands } = useCommandPallette( {
		selectedCommandName,
		setSelectedCommandName,
	} );
	const commands = isContextual ? smpDefaultCommands : [];
	if ( ! commands.length ) {
		return null;
	}

	return (
		<Command.Group about="WPCOM">
			{ commands.map( ( command ) => {
				const itemValue = command.searchLabel ?? command.label;
				return (
					<Command.Item
						key={ command.name }
						value={ itemValue }
						onSelect={ () => command.callback( { close, setSearch } ) }
						id={ cleanForSlug( itemValue ) }
					>
						<HStack
							alignment="left"
							className={ classnames( 'commands-command-menu__item', {
								'has-icon': command.icon || command.image,
							} ) }
						>
							{ command.icon && <Icon icon={ command.icon } /> }
							{ command.image }
							<span>
								<TextHighlight text={ command.label } highlight={ search } />
							</span>
						</HStack>
					</Command.Item>
				);
			} ) }
		</Command.Group>
	);
}

interface CommandInputProps {
	isOpen: boolean;
	search: string;
	setSearch: ( search: string ) => void;
}

function CommandInput( { isOpen, search, setSearch }: CommandInputProps ) {
	const commandMenuInput = useRef< HTMLInputElement >( null );
	const itemValue = useCommandState( ( state ) => state.value );
	const itemId = useMemo( () => cleanForSlug( itemValue ), [ itemValue ] );

	useEffect( () => {
		// Focus the command palette input when mounting the modal.
		if ( isOpen ) {
			commandMenuInput.current?.focus();
		}
	}, [ isOpen ] );

	return (
		<Command.Input
			ref={ commandMenuInput }
			value={ search }
			onValueChange={ setSearch }
			placeholder={ __( 'Search for commands' ) }
			aria-activedescendant={ itemId }
		/>
	);
}

export const WpcomCommandPalette = () => {
	const [ search, setSearch ] = useState( '' );
	const [ isOpen, setIsOpen ] = useState( false );
	const { close, toggle } = {
		close: () => setIsOpen( false ),
		toggle: () => setIsOpen( ( isOpen ) => ! isOpen ),
	};

	// Cmd+K shortcut
	useEffect( () => {
		const down = ( e: KeyboardEvent ) => {
			if ( e.key === 'k' && ( e.metaKey || e.ctrlKey ) ) {
				e.preventDefault();
				toggle();
			}
		};

		document.addEventListener( 'keydown', down );
		return () => document.removeEventListener( 'keydown', down );
	}, [ toggle ] );

	const closeAndReset = () => {
		setSearch( '' );
		close();
	};

	if ( ! isOpen ) {
		return false;
	}

	const onKeyDown = ( event: React.KeyboardEvent< HTMLInputElement > ) => {
		if (
			// Ignore keydowns from IMEs
			event.nativeEvent.isComposing ||
			// Workaround for Mac Safari where the final Enter/Backspace of an IME composition
			// is `isComposing=false`, even though it's technically still part of the composition.
			// These can only be detected by keyCode.
			event.keyCode === 229
		) {
			event.preventDefault();
		}
	};

	const isLoading = false;

	return (
		<Modal
			className="commands-command-menu"
			overlayClassName="commands-command-menu__overlay"
			onRequestClose={ closeAndReset }
			__experimentalHideHeader
		>
			<div className="commands-command-menu__container">
				<Command label={ __( 'Command palette' ) } onKeyDown={ onKeyDown }>
					<div className="commands-command-menu__header">
						<Icon icon={ inputIcon } />
						<CommandInput search={ search } setSearch={ setSearch } isOpen={ isOpen } />
					</div>
					<Command.List>
						{ search && ! isLoading && (
							<Command.Empty>{ __( 'No results found.' ) }</Command.Empty>
						) }
						<CommandMenuGroup
							search={ search }
							close={ closeAndReset }
							isContextual
							setSearch={ setSearch }
						/>
						{ search && (
							<CommandMenuGroup search={ search } close={ closeAndReset } setSearch={ setSearch } />
						) }
					</Command.List>
				</Command>
			</div>
		</Modal>
	);
};
