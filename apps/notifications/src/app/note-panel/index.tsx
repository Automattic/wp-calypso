import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	CardHeader,
	Icon,
	TabPanel,
	useNavigator,
} from '@wordpress/components';
import '@wordpress/components/build-style/style.css';
import { __ } from '@wordpress/i18n';
import { bell } from '@wordpress/icons';
import { useEffect } from 'react';
import { modifierKeyIsActive } from '../../panel/helpers/input';
import { getFilters } from '../../panel/templates/filters';
import NoteList from '../note-list';
import NotePanelActions from './actions';

type FilterName = keyof ReturnType< typeof getFilters >;

const NOTIFICATION_TABS = Object.values( getFilters() ).map( ( { name, label } ) => ( {
	name,
	title: label,
} ) );

const NotePanel = () => {
	const { params, goTo } = useNavigator();
	const { filterName = 'all' } = params;

	useEffect( () => {
		const stopEvent = ( event: KeyboardEvent ) => {
			event.stopPropagation();
			event.preventDefault();
		};

		const handleKeyDown = ( event: KeyboardEvent ) => {
			if ( modifierKeyIsActive( event ) ) {
				return;
			}
			switch ( event.key ) {
				case 'a':
					stopEvent( event );
					goTo( '/all', { replace: true } );
					break;
				case 'u':
					stopEvent( event );
					goTo( '/unread', { replace: true } );
					break;
				case 'c':
					stopEvent( event );
					goTo( '/comments', { replace: true } );
					break;
				case 'f':
					stopEvent( event );
					goTo( '/follows', { replace: true } );
					break;
				case 'l':
					stopEvent( event );
					goTo( '/likes', { replace: true } );
					break;
			}
		};

		window.addEventListener( 'keydown', handleKeyDown, false );
		return () => {
			window.removeEventListener( 'keydown', handleKeyDown, false );
		};
	}, [] );

	return (
		<>
			<CardHeader
				size="small"
				style={ { flexDirection: 'column', alignItems: 'stretch', paddingBottom: 0 } }
			>
				<VStack>
					<HStack>
						<Icon icon={ bell } />
						<Heading level={ 3 } size={ 15 } weight={ 500 }>
							{ __( 'Notifications' ) }
						</Heading>
						<div style={ { marginInlineStart: 'auto' } }>
							<NotePanelActions />
						</div>
					</HStack>
					<TabPanel
						activeClass="is-active"
						tabs={ NOTIFICATION_TABS }
						initialTabName={ filterName as string }
						key={ filterName as string }
						onSelect={ ( tabName ) => {
							goTo( `/${ tabName }`, { replace: true } );
						} }
					>
						{ () => null /* Placeholder div since content is rendered elsewhere */ }
					</TabPanel>
				</VStack>
			</CardHeader>
			<NoteList filterName={ filterName as FilterName } />
		</>
	);
};

export default NotePanel;
