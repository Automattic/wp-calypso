import { recordTracksEvent } from '@automattic/calypso-analytics';
import styled from '@emotion/styled';
import { Modal, TextHighlight, __experimentalHStack as HStack } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Icon, search as inputIcon, chevronLeft as backIcon } from '@wordpress/icons';
import { cleanForSlug } from '@wordpress/url';
import classnames from 'classnames';
import { Command, useCommandState } from 'cmdk';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { COMMAND_SEPARATOR, useCommandFilter } from './use-command-filter';
import {
	Command as CommandType,
	CommandCallBackParams,
	useCommandPalette,
	useExtraCommandsParams,
} from './use-command-palette';
import type { WPCOM } from 'wpcom';

import '@wordpress/commands/build-style/style.css';

interface CommandMenuGroupProps
	extends Pick< CommandCallBackParams, 'close' | 'setSearch' | 'setPlaceholderOverride' > {
	currentSiteId: number | null;
	search: string;
	selectedCommandName: string;
	setSelectedCommandName: ( name: string ) => void;
	setFooterMessage?: ( message: string ) => void;
	setEmptyListNotice?: ( message: string ) => void;
	navigate: ( path: string, openInNewTab: boolean ) => void;
	useExtraCommands?: ( options: useExtraCommandsParams ) => CommandType[];
	wpcom: WPCOM;
	currentRoute: string | null;
}

const StyledCommandsMenuContainer = styled.div( {
	'[cmdk-root] > [cmdk-list]': {
		overflowX: 'hidden',
	},
	'[cmdk-root] > [cmdk-list] [cmdk-empty]': {
		paddingLeft: '24px',
		paddingRight: '24px',
	},
} );

const StyledCommandsEmpty = styled( Command.Empty )( {
	fontSize: '13px',
	textAlign: 'center',
} );

const BackButton = styled.button( {
	cursor: 'pointer',
} );

const LabelWrapper = styled.div( {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	maxWidth: 'calc(100% - 56px)',
	justifyContent: 'center',
} );

const Label = styled.div( {
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	fontSize: '1em',
	'.commands-command-menu__container [cmdk-item] &': {
		color: 'var(--studio-gray-100)',
	},
	'.commands-command-menu__container [cmdk-item][aria-selected=true] &': {
		color: 'var(--studio-white)',
	},
	'.commands-command-menu__container & mark': {
		fontWeight: 700,
	},
} );

const SubLabel = styled( Label )( {
	opacity: 0.7,
	fontSize: '0.9em',
	'.commands-command-menu__container [cmdk-item] &': {
		color: 'var(--studio-gray-60)',
	},
} );

const StyledCommandsFooter = styled.div( {
	fontSize: '0.75rem',
	paddingTop: '12px',
	paddingLeft: '16px',
	paddingRight: '16px',
	paddingBottom: '12px',
	borderTop: '1px solid var(--studio-gray-5)',
	color: 'var(--studio-gray-50)',
} );

export function CommandMenuGroup( {
	currentSiteId,
	search,
	close,
	setSearch,
	setPlaceholderOverride,
	selectedCommandName,
	setSelectedCommandName,
	setFooterMessage,
	setEmptyListNotice,
	navigate,
	useExtraCommands,
	wpcom,
	currentRoute,
}: CommandMenuGroupProps ) {
	const { commands, filterNotice, emptyListNotice } = useCommandPalette( {
		currentSiteId,
		selectedCommandName,
		setSelectedCommandName,
		search,
		navigate,
		useExtraCommands,
		wpcom,
		currentRoute,
	} );

	useEffect( () => {
		setFooterMessage?.( filterNotice ?? '' );
	}, [ setFooterMessage, filterNotice ] );

	useEffect( () => {
		setEmptyListNotice?.( emptyListNotice ?? '' );
	}, [ setEmptyListNotice, emptyListNotice ] );

	if ( ! commands.length ) {
		return null;
	}

	return (
		<Command.Group about="WPCOM">
			{ commands.map( ( command ) => {
				const itemValue = [ command.label, command.searchLabel ]
					.filter( Boolean )
					.join( COMMAND_SEPARATOR );
				return (
					<Command.Item
						key={ command.name }
						value={ itemValue }
						onSelect={ () =>
							command.callback( {
								close: () => close( command.name, true ),
								setSearch,
								setPlaceholderOverride,
								command,
							} )
						}
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
							<LabelWrapper>
								<Label>
									<TextHighlight
										text={ `${ command.label }${ command.siteFunctions ? '…' : '' }` }
										highlight={ search }
									/>
								</Label>

								{ command.subLabel && (
									<SubLabel>
										<TextHighlight text={ command.subLabel } highlight={ search } />
									</SubLabel>
								) }
							</LabelWrapper>
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
	selectedCommandName: string;
	placeholder?: string;
}

function CommandInput( {
	isOpen,
	search,
	setSearch,
	placeholder,
	selectedCommandName,
}: CommandInputProps ) {
	const commandMenuInput = useRef< HTMLInputElement >( null );
	const itemValue = useCommandState( ( state ) => state.value );
	const itemId = useMemo( () => cleanForSlug( itemValue ), [ itemValue ] );

	useEffect( () => {
		// Focus the command palette input when mounting the modal,
		// or when a command is selected.
		if ( isOpen || selectedCommandName ) {
			commandMenuInput.current?.focus();
		}
	}, [ isOpen, selectedCommandName ] );

	return (
		<Command.Input
			ref={ commandMenuInput }
			value={ search }
			onValueChange={ setSearch }
			placeholder={ placeholder || __( 'Search for commands', __i18n_text_domain__ ) }
			aria-activedescendant={ itemId }
		/>
	);
}

interface NotFoundMessageProps {
	selectedCommandName: string;
	search: string;
	emptyListNotice?: string;
	currentRoute: string | null;
}

interface CommandPaletteProps {
	currentSiteId: number | null;
	navigate: ( path: string, openInNewTab: boolean ) => void;
	useExtraCommands?: ( options: useExtraCommandsParams ) => CommandType[];
	wpcom: WPCOM;
	currentRoute: string | null;
}

const NotFoundMessage = ( {
	selectedCommandName,
	search,
	emptyListNotice,
	currentRoute,
}: NotFoundMessageProps ) => {
	const trackNotFoundDebounced = useDebounce( () => {
		recordTracksEvent( 'calypso_hosting_command_palette_not_found', {
			current_route: currentRoute,
			search_text: search,
		} );
	}, 600 );

	useEffect( () => {
		// Track search queries only for root
		if ( ! selectedCommandName && search ) {
			trackNotFoundDebounced();
		}
		return trackNotFoundDebounced.cancel;
	}, [ search, selectedCommandName, trackNotFoundDebounced ] );

	return <>{ emptyListNotice || __( 'No results found.', __i18n_text_domain__ ) }</>;
};

const CommandPalette = ( {
	currentSiteId,
	navigate,
	useExtraCommands,
	wpcom,
	currentRoute,
}: CommandPaletteProps ) => {
	const [ placeHolderOverride, setPlaceholderOverride ] = useState( '' );
	const [ search, setSearch ] = useState( '' );
	const [ selectedCommandName, setSelectedCommandName ] = useState( '' );
	const [ isOpen, setIsOpen ] = useState( false );
	const [ footerMessage, setFooterMessage ] = useState( '' );
	const [ emptyListNotice, setEmptyListNotice ] = useState( '' );
	const open = useCallback( () => {
		setIsOpen( true );
		recordTracksEvent( 'calypso_hosting_command_palette_open', {
			current_route: currentRoute,
		} );
	}, [ currentRoute ] );
	const close = useCallback< CommandMenuGroupProps[ 'close' ] >(
		( commandName = '', isExecuted = false ) => {
			recordTracksEvent( 'calypso_hosting_command_palette_close', {
				// For nested commands the command.name would be the siteId
				// For root commands the selectedCommandName would be empty
				command: selectedCommandName || commandName,
				current_route: currentRoute,
				search_text: search,
				is_executed: isExecuted,
			} );
			setIsOpen( false );
		},
		[ currentRoute, search, selectedCommandName ]
	);
	const toggle = useCallback( () => ( isOpen ? close() : open() ), [ isOpen, close, open ] );
	const commandFilter = useCommandFilter();

	const commandListRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		if ( commandListRef.current !== null ) {
			commandListRef.current.scrollTop = 0;
		}
	}, [ selectedCommandName ] );

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

	const reset = () => {
		setPlaceholderOverride( '' );
		setSearch( '' );
		setSelectedCommandName( '' );
	};
	const closeAndReset = () => {
		reset();
		close();
	};

	const goBackToRootCommands = ( fromKeyboard: boolean ) => {
		recordTracksEvent( 'calypso_hosting_command_palette_back_to_root', {
			command: selectedCommandName,
			current_route: currentRoute,
			search_text: search,
			from_keyboard: fromKeyboard,
		} );
		reset();
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
		if (
			selectedCommandName &&
			( event.key === 'Escape' || ( event.key === 'Backspace' && ! search ) )
		) {
			event.preventDefault();
			goBackToRootCommands( true );
		}
	};

	return (
		<Modal
			className="commands-command-menu"
			overlayClassName="commands-command-menu__overlay"
			onRequestClose={ closeAndReset }
			__experimentalHideHeader
		>
			<StyledCommandsMenuContainer className="commands-command-menu__container">
				<Command
					label={ __( 'Command palette', __i18n_text_domain__ ) }
					onKeyDown={ onKeyDown }
					filter={ commandFilter }
				>
					<div className="commands-command-menu__header">
						{ selectedCommandName ? (
							<BackButton
								type="button"
								onClick={ () => goBackToRootCommands( false ) }
								aria-label={ __( 'Go back to the previous screen', __i18n_text_domain__ ) }
							>
								<Icon icon={ backIcon } />
							</BackButton>
						) : (
							<Icon icon={ inputIcon } />
						) }
						<CommandInput
							selectedCommandName={ selectedCommandName }
							search={ search }
							setSearch={ setSearch }
							isOpen={ isOpen }
							placeholder={ placeHolderOverride }
						/>
					</div>
					<Command.List ref={ commandListRef }>
						<StyledCommandsEmpty>
							<NotFoundMessage
								selectedCommandName={ selectedCommandName }
								search={ search }
								emptyListNotice={ emptyListNotice }
								currentRoute={ currentRoute }
							/>
						</StyledCommandsEmpty>
						<CommandMenuGroup
							currentSiteId={ currentSiteId }
							search={ search }
							close={ ( commandName, isExecuted ) => {
								close( commandName, isExecuted );
								reset();
							} }
							setSearch={ setSearch }
							setPlaceholderOverride={ setPlaceholderOverride }
							selectedCommandName={ selectedCommandName }
							setSelectedCommandName={ setSelectedCommandName }
							setFooterMessage={ setFooterMessage }
							setEmptyListNotice={ setEmptyListNotice }
							navigate={ navigate }
							useExtraCommands={ useExtraCommands }
							wpcom={ wpcom }
							currentRoute={ currentRoute }
						/>
					</Command.List>
				</Command>
				{ footerMessage && <StyledCommandsFooter>{ footerMessage }</StyledCommandsFooter> }
			</StyledCommandsMenuContainer>
		</Modal>
	);
};

export default CommandPalette;
export type { Command, CommandCallBackParams } from './use-command-palette';
