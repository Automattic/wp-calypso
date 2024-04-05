import { recordTracksEvent } from '@automattic/calypso-analytics';
import styled from '@emotion/styled';
import { __experimentalHStack as HStack, Modal, TextHighlight } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { chevronLeft as backIcon, Icon, search as inputIcon } from '@wordpress/icons';
import { cleanForSlug } from '@wordpress/url';
import classnames from 'classnames';
import { Command, useCommandState } from 'cmdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	CommandPaletteContext,
	CommandPaletteContextProvider,
	useCommandPaletteContext,
} from './context';
import { COMMAND_SEPARATOR, useCommandFilter } from './use-command-filter';
import { useCommandPalette } from './use-command-palette';
import type { Command as PaletteCommand } from './commands';
import type { SiteExcerptData } from '@automattic/sites';
import './style.scss';
import '@wordpress/commands/build-style/style.css';

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

export function CommandMenuGroup() {
	const {
		search,
		close,
		setSearch,
		setPlaceholderOverride,
		setFooterMessage,
		setEmptyListNotice,
		navigate,
		currentRoute,
	} = useCommandPaletteContext();
	const { commands, filterNotice, emptyListNotice } = useCommandPalette();

	useEffect( () => {
		setFooterMessage( filterNotice ?? '' );
	}, [ setFooterMessage, filterNotice ] );

	useEffect( () => {
		setEmptyListNotice( emptyListNotice ?? '' );
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
								navigate,
								currentRoute,
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
										text={ `${ command.label }${ command.siteSelector ? '…' : '' }` }
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

function CommandInput() {
	const { placeHolderOverride, search, selectedCommandName, setSearch, isOpen } =
		useCommandPaletteContext();
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
			placeholder={ placeHolderOverride || __( 'Search for commands', __i18n_text_domain__ ) }
			aria-activedescendant={ itemId }
		/>
	);
}

const NotFoundMessage = () => {
	const { currentRoute, emptyListNotice, search, selectedCommandName } = useCommandPaletteContext();
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

export interface CommandPaletteProps {
	currentRoute: string;
	currentSiteId: number | null;
	isOpenGlobal?: boolean;
	navigate: ( path: string, openInNewTab?: boolean ) => void;
	onClose?: () => void;
	useCommands: () => PaletteCommand[];
	useSites: () => SiteExcerptData[];
	userCapabilities: { [ key: number ]: { [ key: string ]: boolean } };
}

const COMMAND_PALETTE_MODAL_OPEN_CLASSNAME = 'command-palette-modal-open';
// We need to change the `overflow` of the html element because it's set to `scroll` on _reset.scss
// Ideally, this would be handled by the `@wordpress/components` `Modal` component,
// but it doesn't have a `htmlOpenClassName` prop
const toggleModalOpenClassnameOnDocumentHtmlElement = ( isModalOpen: boolean ) => {
	document.documentElement.classList.toggle( COMMAND_PALETTE_MODAL_OPEN_CLASSNAME, isModalOpen );
};

const CommandPalette = ( {
	currentRoute,
	currentSiteId,
	isOpenGlobal,
	navigate,
	onClose = () => {},
	useCommands,
	useSites,
	userCapabilities,
}: CommandPaletteProps ) => {
	const [ placeHolderOverride, setPlaceholderOverride ] = useState( '' );
	const [ search, setSearch ] = useState( '' );
	const [ selectedCommandName, setSelectedCommandName ] = useState( '' );
	const [ isOpenLocal, setIsOpenLocal ] = useState( false );
	const isOpen = isOpenLocal || isOpenGlobal;
	const [ footerMessage, setFooterMessage ] = useState( '' );
	const [ emptyListNotice, setEmptyListNotice ] = useState( '' );
	const open = useCallback( () => {
		toggleModalOpenClassnameOnDocumentHtmlElement( true );

		setIsOpenLocal( true );
		recordTracksEvent( 'calypso_hosting_command_palette_open', {
			current_route: currentRoute,
		} );
	}, [ currentRoute ] );
	const close = useCallback< CommandPaletteContext[ 'close' ] >(
		( commandName = '', isExecuted = false ) => {
			toggleModalOpenClassnameOnDocumentHtmlElement( false );

			setIsOpenLocal( false );
			onClose?.();
			recordTracksEvent( 'calypso_hosting_command_palette_close', {
				// For nested commands the command.name would be the siteId
				// For root commands the selectedCommandName would be empty
				command: selectedCommandName || commandName,
				current_route: currentRoute,
				search_text: search,
				is_executed: isExecuted,
			} );
		},
		[ currentRoute, onClose, search, selectedCommandName ]
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
		<CommandPaletteContextProvider
			currentSiteId={ currentSiteId }
			navigate={ navigate }
			useCommands={ useCommands }
			currentRoute={ currentRoute }
			isOpen={ isOpen }
			useSites={ useSites }
			userCapabilities={ userCapabilities }
			search={ search }
			close={ ( commandName, isExecuted ) => {
				close( commandName, isExecuted );
				reset();
			} }
			emptyListNotice={ emptyListNotice }
			placeHolderOverride={ placeHolderOverride }
			selectedCommandName={ selectedCommandName }
			setEmptyListNotice={ setEmptyListNotice }
			setFooterMessage={ setFooterMessage }
			setPlaceholderOverride={ setPlaceholderOverride }
			setSearch={ setSearch }
			setSelectedCommandName={ setSelectedCommandName }
		>
			<Modal
				bodyOpenClassName={ COMMAND_PALETTE_MODAL_OPEN_CLASSNAME }
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
							<CommandInput />
						</div>
						<Command.List ref={ commandListRef }>
							<StyledCommandsEmpty>
								<NotFoundMessage />
							</StyledCommandsEmpty>
							<CommandMenuGroup />
						</Command.List>
					</Command>
					{ footerMessage && <StyledCommandsFooter>{ footerMessage }</StyledCommandsFooter> }
				</StyledCommandsMenuContainer>
			</Modal>
		</CommandPaletteContextProvider>
	);
};

export default CommandPalette;
export type { Command, CommandCallBackParams } from './commands';
export { COMMANDS } from './commands';
