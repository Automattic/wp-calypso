import styled from '@emotion/styled';
import { Modal, TextHighlight, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, search as inputIcon } from '@wordpress/icons';
import { cleanForSlug } from '@wordpress/url';
import classnames from 'classnames';
import { Command, useCommandState } from 'cmdk';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { CommandCallBackParams, useCommandPallette } from './use-command-pallette';

import '@wordpress/commands/build-style/style.css';

interface CommandMenuGroupProps
	extends Pick< CommandCallBackParams, 'close' | 'setSearch' | 'setPlaceholderOverride' > {
	isContextual?: boolean;
	search: string;
	selectedCommandName: string;
	setSelectedCommandName: ( name: string ) => void;
}

const StyledCommandsMenuContainer = styled.div( {
	'[cmdk-root] > [cmdk-list]': {
		overflowX: 'hidden',
	},
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

const PaletteBreadCrumb = styled.div( {
	height: 20,
	color: 'var( --studio-gray-100 )',
	display: 'inline-flex',
	padding: '0 8px',
	fontSize: 12,
	borderRadius: 4,
	margin: '12px 12px 0',
	textTransform: 'capitalize',
} );

const StyledCommandsTitle = styled.div( {
	color: 'var( --studio-gray-50 )',
} );

const SubLabel = styled( Label )( {
	opacity: 0.7,
	fontSize: '0.9em',
	'.commands-command-menu__container [cmdk-item] &': {
		color: 'var(--studio-gray-60)',
	},
} );

export function CommandMenuGroup( {
	isContextual,
	search,
	close,
	setSearch,
	setPlaceholderOverride,
	selectedCommandName,
	setSelectedCommandName,
}: CommandMenuGroupProps ) {
	const currentPath = useSelector( ( state ) => getCurrentRoute( state ) );
	const { commands } = useCommandPallette( {
		selectedCommandName,
		setSelectedCommandName,
		filter: isContextual ? ( command ) => command.context?.includes( currentPath ) : undefined,
	} );

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
						onSelect={ () => command.callback( { close, setSearch, setPlaceholderOverride } ) }
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
									<TextHighlight text={ command.label } highlight={ search } />
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
	placeholder?: string;
}

function CommandInput( { isOpen, search, setSearch, placeholder }: CommandInputProps ) {
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
			placeholder={ placeholder || __( 'Search for commands' ) }
			aria-activedescendant={ itemId }
		/>
	);
}

export const WpcomCommandPalette = () => {
	const [ placeHolderOverride, setPlaceholderOverride ] = useState( '' );
	const [ search, setSearch ] = useState( '' );
	const [ selectedCommandName, setSelectedCommandName ] = useState( '' );
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

	const reset = () => {
		setPlaceholderOverride( '' );
		setSearch( '' );
		setSelectedCommandName( '' );
	};
	const closeAndReset = () => {
		reset();
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
		if (
			( event.key === 'Escape' && selectedCommandName ) ||
			( event.key === 'Backspace' && ! search )
		) {
			event.preventDefault();
			reset();
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
			<StyledCommandsMenuContainer className="commands-command-menu__container">
				<Command label={ __( 'Command palette' ) } onKeyDown={ onKeyDown }>
					<div>
						{ selectedCommandName && (
							<PaletteBreadCrumb>
								<StyledCommandsTitle>Commands / </StyledCommandsTitle>
								<div>
									{ '\u00A0' }
									{ selectedCommandName }
								</div>
							</PaletteBreadCrumb>
						) }
					</div>
					<div className="commands-command-menu__header">
						<Icon icon={ inputIcon } />
						<CommandInput
							search={ search }
							setSearch={ setSearch }
							isOpen={ isOpen }
							placeholder={ placeHolderOverride }
						/>
					</div>
					<Command.List>
						{ search && ! isLoading && (
							<Command.Empty>{ __( 'No results found.' ) }</Command.Empty>
						) }
						<CommandMenuGroup
							isContextual={ ! search && ! selectedCommandName }
							search={ search }
							close={ closeAndReset }
							setSearch={ setSearch }
							setPlaceholderOverride={ setPlaceholderOverride }
							selectedCommandName={ selectedCommandName }
							setSelectedCommandName={ setSelectedCommandName }
						/>
					</Command.List>
				</Command>
			</StyledCommandsMenuContainer>
		</Modal>
	);
};
