import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	CardHeader,
} from '@wordpress/components';
import '@wordpress/components/build-style/style.css';
import { __ } from '@wordpress/i18n';
import { Badge, Tabs } from '@wordpress/ui';
import { useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import { getFilters } from '../../panel/templates/filters';
import ErrorBoundary from '../error-boundary';
import NoteList from '../note-list';
import CloseButton from '../templates/close-button';
import { useIsSimplifiedNote } from '../use-is-simplified-note';
import NotePanelActions from './actions';
import type { FilterName } from '../types';

export const getNotificationTabs = () =>
	Object.values( getFilters() ).map( ( { name, label } ) => ( {
		name,
		title: label,
	} ) );

type NotePanelProps = {
	isDismissible?: boolean;
	filterName: FilterName;
	setFilterName: ( filterName: FilterName ) => void;
	selectedNoteId: string | undefined;
	setSelectedNoteId: ( noteId: string | undefined ) => void;
};

const NotePanel = ( {
	isDismissible,
	filterName,
	setFilterName,
	selectedNoteId,
	setSelectedNoteId,
}: NotePanelProps ) => {
	const notificationTabs = getNotificationTabs();
	const tabRefs = useRef< Record< string, HTMLButtonElement > >( {} );
	const keyboardShortcutsAreEnabled = useSelector( getKeyboardShortcutsEnabled );
	const isSimplified = useIsSimplifiedNote();

	const handleSelect = useCallback(
		( tabId: string | null | undefined ) => {
			if ( tabId ) {
				setFilterName( tabId as FilterName );
				// Clear the selection — a note from the previous filter would
				// otherwise stay rendered in the detail pane while the list
				// switches to the new filter's notes.
				setSelectedNoteId( undefined );
			}
		},
		[ setFilterName, setSelectedNoteId ]
	);

	useEffect( () => {
		const stopEvent = ( event: KeyboardEvent ) => {
			event.stopPropagation();
			event.preventDefault();
		};

		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( ! keyboardShortcutsAreEnabled ) {
				return;
			}
			if ( modifierKeyIsActive( event ) ) {
				return;
			}
			if ( selectedNoteId ) {
				return;
			}

			const shortcutToTabId: Record< string, string > = {
				a: 'all',
				u: 'unread',
				c: 'comments',
				f: 'follows',
				s: 'follows', // It’s more intuitive to use s, since we display “Subscribes.”
				l: 'likes',
			};

			const tabId = shortcutToTabId[ event.key ];
			if ( tabId ) {
				stopEvent( event );
				handleSelect( tabId );

				// Ensure that keyboard navigation focuses on the selected tab.
				tabRefs.current[ tabId ]?.focus();
			}
		};

		window.addEventListener( 'keydown', handleKeyDown, false );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, false );
		};
	}, [ tabRefs, handleSelect, keyboardShortcutsAreEnabled, selectedNoteId ] );

	return (
		<Tabs.Root className="wpnc-app__tabs" value={ filterName } onValueChange={ handleSelect }>
			<CardHeader
				isBorderless
				size="small"
				style={ { flexDirection: 'column', alignItems: 'stretch', paddingBottom: 0 } }
			>
				<VStack>
					<HStack>
						<HStack justify="flex-start">
							<Heading
								level={ 3 }
								size={ 15 }
								weight="var(--wpds-typography-font-weight-emphasis, 600)"
							>
								{ __( 'Notifications' ) }
							</Heading>
							{ isSimplified && (
								<Badge
									className="wpnc-app__beta-badge"
									intent="informational"
									render={
										<a href="https://wp.me/p9zg7s-dv" target="_blank" rel="noopener noreferrer" />
									}
								>
									{ __( 'Beta' ) }
								</Badge>
							) }
						</HStack>
						<HStack justify="flex-end">
							<NotePanelActions />
							{ isDismissible && <CloseButton /> }
						</HStack>
					</HStack>
					<Tabs.List variant="minimal" activateOnFocus>
						{ notificationTabs.map( ( { name, title } ) => (
							<Tabs.Tab
								key={ name }
								value={ name }
								ref={ ( element: HTMLButtonElement ) => {
									tabRefs.current[ name ] = element;
								} }
							>
								{ title }
							</Tabs.Tab>
						) ) }
					</Tabs.List>
				</VStack>
			</CardHeader>
			{ notificationTabs.map( ( { name } ) => (
				// The list inside is focusable, so the panel needn't be a tab stop of its own.
				<Tabs.Panel key={ name } value={ name } className="wpnc-app__tab-panel" tabIndex={ -1 }>
					{ /* Scope the boundary to the list content so a render error there
					   leaves the header controls (tabs, settings) intact and only
					   overlays the message, instead of collapsing the whole panel.
					   Only the active panel renders it: the outgoing one stays mounted
					   while it hides. */ }
					{ name === filterName && (
						<ErrorBoundary>
							{ /* Key by `filterName` so switching tabs remounts the list. The tab
							   filter is applied outside the DataViews `view`, so DataViews'
							   infinite-scroll row accumulation would otherwise carry stale
							   notes from the previously selected tab. */ }
							<NoteList
								key={ filterName }
								filterName={ filterName }
								selectedNoteId={ selectedNoteId }
								setSelectedNoteId={ setSelectedNoteId }
							/>
						</ErrorBoundary>
					) }
				</Tabs.Panel>
			) ) }
		</Tabs.Root>
	);
};

export default NotePanel;
