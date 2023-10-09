import { Modal, TextHighlight, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, search as inputIcon } from '@wordpress/icons';
import classnames from 'classnames';
import { Command, useCommandState } from 'cmdk';
import { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { useSMPCommands } from '../hooks/use-smp-commands';

import '@wordpress/commands/build-style/style.css';

// Files ported and adpted from https://github.com/WordPress/gutenberg/blob/f92f9e28ba4fb2e435cb89d5b327b707cb805ba7/packages/commands/src/components/command-menu.js

const loaders = Object.values( {
	[ 'sshLoader' ]: {
		name: 'loader ssh name',
		context: 'loader ssh name',
		hook: () => {
			return { commands: [], isLoading: false };
		},
	},
} );

interface CommandMenuLoaderProps {
	name?: string;
	search: string;
	hook: any;
	setLoader: ( loaders: any, isLoading?: boolean ) => void;
	close: () => void;
}
function CommandMenuLoader( { name, search, hook, setLoader, close }: CommandMenuLoaderProps ) {
	const { isLoading, commands = [] } = hook( { search } ) ?? {};
	useEffect( () => {
		setLoader( name, isLoading );
	}, [ setLoader, name, isLoading ] );

	if ( ! commands.length ) {
		return null;
	}

	return (
		<>
			<Command.List>
				{ commands.map( ( command: any ) => (
					<Command.Item
						key={ command.name }
						value={ command.searchLabel ?? command.label }
						onSelect={ () => command.callback( { close } ) }
						id={ command.name }
					>
						<HStack
							alignment="left"
							className={ classnames( 'commands-command-menu__item', {
								'has-icon': command.icon,
							} ) }
						>
							{ command.icon && <Icon icon={ command.icon } /> }
							<span>
								<TextHighlight text={ command.label } highlight={ search } />
							</span>
						</HStack>
					</Command.Item>
				) ) }
			</Command.List>
		</>
	);
}

interface CommandMenuLoaderWrapperProps {
	hook: any;
	search: string;
	setLoader: ( loaders: any ) => void;
	close: () => void;
}
export function CommandMenuLoaderWrapper( {
	hook,
	search,
	setLoader,
	close,
}: CommandMenuLoaderWrapperProps ) {
	// The "hook" prop is actually a custom React hook
	// so to avoid breaking the rules of hooks
	// the CommandMenuLoaderWrapper component need to be
	// remounted on each hook prop change
	// We use the key state to make sure we do that properly.
	const currentLoader = useRef( hook );
	const [ key, setKey ] = useState( 0 );
	useEffect( () => {
		if ( currentLoader.current !== hook ) {
			currentLoader.current = hook;
			setKey( ( prevKey ) => prevKey + 1 );
		}
	}, [ hook ] );

	return (
		<CommandMenuLoader
			key={ key }
			hook={ currentLoader.current }
			search={ search }
			setLoader={ setLoader }
			close={ close }
		/>
	);
}

interface CommandMenuGroupProps {
	isContextual?: boolean;
	search: string;
	setLoader: ( loaders: any ) => void;
	close: () => void;
}

export function CommandMenuGroup( {
	isContextual,
	search,
	setLoader,
	close,
}: CommandMenuGroupProps ) {
	const [ selectedCommandName, setSelectedCommandName ] = useState( '' );
	const { commands: smpDefaultCommands } = useSMPCommands( {
		selectedCommandName,
		setSelectedCommandName,
	} );
	const commands = isContextual ? smpDefaultCommands : [];
	// const { commands, loaders } = useSelect(
	// 	( select ) => {
	// 		const { getCommands, getCommandLoaders } = select( commandsStore );
	// 		return {
	// 			commands: getCommands( isContextual ),
	// 			loaders: getCommandLoaders( isContextual ),
	// 		};
	// 	},
	// 	[ isContextual ]
	// );

	if ( ! commands.length && ! loaders.length ) {
		return null;
	}

	return (
		<Command.Group>
			{ commands.map( ( command ) => (
				<Command.Item
					key={ command.name }
					value={ command.searchLabel ?? command.label }
					onSelect={ () => command.callback( { close } ) }
					id={ command.name }
				>
					<HStack
						alignment="left"
						className={ classnames( 'commands-command-menu__item', {
							'has-icon': command.icon,
						} ) }
					>
						{ command.icon && <Icon icon={ command.icon } /> }
						<span>
							<TextHighlight text={ command.label } highlight={ search } />
						</span>
					</HStack>
				</Command.Item>
			) ) }
			{ loaders.map( ( loader ) => (
				<CommandMenuLoaderWrapper
					key={ loader.name }
					hook={ loader.hook }
					search={ search }
					setLoader={ setLoader }
					close={ close }
				/>
			) ) }
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
	const _value = useCommandState( ( state ) => state.value );
	const selectedItemId = useMemo( () => {
		const item = document.querySelector( `[cmdk-item=""][data-value="${ _value }"]` );
		return item?.getAttribute( 'id' );
	}, [ _value ] );
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
			aria-activedescendant={ selectedItemId }
			icon={ search }
		/>
	);
}

export const CommandPalette = () => {
	// const { registerShortcut } = useDispatch( keyboardShortcutsStore );
	const [ search, setSearch ] = useState( '' );
	const [ isOpen, setIsOpen ] = useState( false ); // useSelect( ( select ) => select( commandsStore ).isOpen(), [] );
	const { close, toggle } = {
		close: () => setIsOpen( false ),
		toggle: () => setIsOpen( ( isOpen ) => ! isOpen ),
	};
	// useDispatch( commandsStore );
	const [ loaders, setLoaders ] = useState( {} );

	// Cmd+K shortcut
	useEffect( () => {
		const down = ( e: any ) => {
			if ( e.key === 'k' && ( e.metaKey || e.ctrlKey ) ) {
				e.preventDefault();
				toggle();
			}
		};

		document.addEventListener( 'keydown', down );
		return () => document.removeEventListener( 'keydown', down );
	}, [] );

	const setLoader = useCallback(
		( name: string, value: any ) =>
			setLoaders( ( current ) => ( {
				...current,
				[ name ]: value,
			} ) ),
		[]
	);
	const closeAndReset = () => {
		setSearch( '' );
		close();
	};

	if ( ! isOpen ) {
		return false;
	}

	const onKeyDown = ( event: any ) => {
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

	const isLoading = Object.values( loaders ).some( Boolean );

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
							setLoader={ setLoader }
							close={ closeAndReset }
							isContextual
						/>
						{ search && (
							<CommandMenuGroup search={ search } setLoader={ setLoader } close={ closeAndReset } />
						) }
					</Command.List>
				</Command>
			</div>
		</Modal>
	);
};
