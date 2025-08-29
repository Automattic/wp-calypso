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
