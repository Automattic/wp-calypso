import {
	FlexItem,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	CardHeader,
	privateApis,
} from '@wordpress/components';
import '@wordpress/components/build-style/style.css';
import { __ } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { PREMADE_VIEWS, resolveViewOrder, type StoredView } from '../../common/premade-views';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import getKeyboardShortcutsEnabled from '../../panel/state/selectors/get-keyboard-shortcuts-enabled';
import getViews from '../../panel/state/selectors/get-views';
import { getFilters } from '../../panel/templates/filters';
import { useAppContext } from '../context';
import ErrorBoundary from '../error-boundary';
import NoteList from '../note-list';
import CloseButton from '../templates/close-button';
import NotePanelActions from './actions';
import ViewPicker from './view-picker';
import type { FilterName } from '../types';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Tabs } = unlock( privateApis );

// Above this many tabs the strip has no room to spare, so the picker stops trailing
// the last tab and sits at the panel edge instead.
const MAX_TABS_BESIDE_PICKER = 4;

// Every view this panel can show, in the user's order, each flagged hidden or not.
export const getResolvedViews = ( storedViews: StoredView[] = [] ) => {
	const known = [
		...Object.values( getFilters() ).map( ( { name, label } ) => ( {
			name,
			label,
			isPremade: false,
		} ) ),
		...PREMADE_VIEWS.map( ( { name, label } ) => ( { name, label, isPremade: true } ) ),
	];

	return resolveViewOrder( known, storedViews ).map( ( { view, hidden } ) => ( {
		name: view.name,
		label: view.label,
		hidden,
	} ) );
};

export const getNotificationViews = ( storedViews: StoredView[] = [] ) =>
	getResolvedViews( storedViews )
		.filter( ( { hidden } ) => ! hidden )
		.map( ( { name, label } ) => ( { name, title: label } ) );

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
	const storedViews = useSelector( getViews );
	// Memoized because the panel re-renders on every notes-store update, and these feed
	// the keydown effect's dependencies below.
	const resolvedViews = useMemo( () => getResolvedViews( storedViews ), [ storedViews ] );
	const notificationViews = useMemo( () => getNotificationViews( storedViews ), [ storedViews ] );
	const isPickerBesideTabs = notificationViews.length <= MAX_TABS_BESIDE_PICKER;
	const { isViewSettingsEnabled } = useAppContext();
	const tabRefs = useRef< Record< string, HTMLButtonElement > >( {} );
	const keyboardShortcutsAreEnabled = useSelector( getKeyboardShortcutsEnabled );

	// A tab hidden while it was selected leaves `filterName` pointing at a tab that
	// is no longer rendered, which would leave the tab list with nothing selected.
	const activeFilterName = notificationViews.some( ( { name } ) => name === filterName )
		? filterName
		: 'all';

	useEffect( () => {
		if ( activeFilterName !== filterName ) {
			setFilterName( activeFilterName );
		}
	}, [ activeFilterName, filterName, setFilterName ] );

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

			const shortcutToTabId: Record< string, string > = {
				a: 'all',
				u: 'unread',
				c: 'comments',
				f: 'follows',
				s: 'follows', // It’s more intuitive to use s, since we display “Subscribes.”
				l: 'likes',
			};

			const tabId = shortcutToTabId[ event.key ];
			if ( tabId && notificationViews.some( ( { name } ) => name === tabId ) ) {
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
	}, [ tabRefs, handleSelect, keyboardShortcutsAreEnabled, notificationViews ] );

	return (
		<>
			<CardHeader
				size="small"
				style={ { flexDirection: 'column', alignItems: 'stretch', paddingBottom: 0 } }
			>
				<VStack>
					<HStack>
						<HStack justify="flex-start">
							<Heading level={ 3 } size={ 15 } weight={ 500 }>
								{ __( 'Notifications' ) }
							</Heading>
						</HStack>
						<HStack justify="flex-end">
							<NotePanelActions />
							{ isDismissible && <CloseButton /> }
						</HStack>
					</HStack>
					<HStack justify="flex-start" alignment="center" spacing={ 1 }>
						{ /* `width: fit-content` keeps the strip only as wide as its tabs, so the
						   picker sits beside the last one; `minWidth: 0` lets it shrink and scroll
						   when there are more tabs than room, leaving the picker at the edge. The
						   tab list's own `fit-content` rule is in a zero-specificity `:where()`,
						   so it loses to FlexItem's `display: block`. */ }
						<FlexItem style={ { minWidth: 0, width: 'fit-content' } }>
							<Tabs selectedTabId={ activeFilterName } onSelect={ handleSelect }>
								<Tabs.TabList
									className="wpnc-app__tab-list"
									style={ {
										maxWidth: '100%',
									} }
								>
									{ notificationViews.map( ( { name, title } ) => (
										<Tabs.Tab
											key={ name }
											tabId={ name }
											style={ { fontFamily: 'inherit', fontWeight: 500, lineHeight: '16px' } }
											ref={ ( element: HTMLButtonElement ) => {
												tabRefs.current[ name ] = element;
											} }
										>
											{ title }
										</Tabs.Tab>
									) ) }
								</Tabs.TabList>
							</Tabs>
						</FlexItem>
						{ isViewSettingsEnabled && (
							<FlexItem>
								<ViewPicker
									views={ resolvedViews }
									className={ isPickerBesideTabs ? undefined : 'is-at-edge' }
								/>
							</FlexItem>
						) }
					</HStack>
				</VStack>
			</CardHeader>
			{ /* Scope the boundary to the list content so a render error there
			   leaves the header controls (tabs, settings) intact and only
			   overlays the message, instead of collapsing the whole panel. */ }
			<ErrorBoundary>
				{ /* Key by `filterName` so switching tabs remounts the list. The tab
				   filter is applied outside the DataViews `view`, so DataViews'
				   infinite-scroll row accumulation would otherwise carry stale
				   notes from the previously selected tab. */ }
				<NoteList
					key={ activeFilterName }
					filterName={ activeFilterName }
					selectedNoteId={ selectedNoteId }
					setSelectedNoteId={ setSelectedNoteId }
				/>
			</ErrorBoundary>
		</>
	);
};

export default NotePanel;
