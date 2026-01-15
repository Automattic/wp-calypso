import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	CardHeader,
	Icon,
	useNavigator,
	privateApis,
} from '@wordpress/components';
import '@wordpress/components/build-style/style.css';
import { __ } from '@wordpress/i18n';
import { bell } from '@wordpress/icons';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useEffect, useCallback, useRef } from 'react';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import { getFilters } from '../../panel/templates/filters';
import NoteList from '../note-list';
import CloseButton from '../templates/close-button';
import NotePanelActions from './actions';

type FilterName = keyof ReturnType< typeof getFilters >;

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);

const { Tabs } = unlock( privateApis );

export const NOTIFICATION_TABS = Object.values( getFilters() ).map( ( { name, label } ) => ( {
	name,
	title: label,
} ) );

const NotePanel = ( { isDismissible }: { isDismissible?: boolean } ) => {
	const { params, goTo } = useNavigator();
	const { filterName = 'all' } = params;
	const tabRefs = useRef< Record< string, HTMLButtonElement > >( {} );

	const handleSelect = useCallback(
		( tabId: string ) => {
			goTo( `/${ tabId }`, { replace: true, skipFocus: true } );
		},
		[ goTo ]
	);

	useEffect( () => {
		const stopEvent = ( event: KeyboardEvent ) => {
			event.stopPropagation();
			event.preventDefault();
		};

		const handleKeyDown = ( event: KeyboardEvent ) => {
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
	}, [ tabRefs, handleSelect ] );

	return (
		<>
			<CardHeader
				size="small"
				style={ { flexDirection: 'column', alignItems: 'stretch', paddingBottom: 0 } }
			>
				<VStack>
					<HStack>
						<HStack justify="flex-start">
							<Icon icon={ bell } />
							<Heading level={ 3 } size={ 15 } weight={ 500 }>
								{ __( 'Notifications' ) }
							</Heading>
						</HStack>
						<HStack justify="flex-end">
							<NotePanelActions />
							{ isDismissible && <CloseButton /> }
						</HStack>
					</HStack>
					<Tabs selectedTabId={ filterName } onSelect={ handleSelect }>
						<Tabs.TabList
							style={ {
								maxWidth: '100%',
							} }
						>
							{ NOTIFICATION_TABS.map( ( { name, title } ) => (
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
				</VStack>
			</CardHeader>
			<NoteList filterName={ filterName as FilterName } />
		</>
	);
};

export default NotePanel;
