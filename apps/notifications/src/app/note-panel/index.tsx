import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalHeading as Heading,
	CardHeader,
	Icon,
	TabPanel,
} from '@wordpress/components';
import '@wordpress/components/build-style/style.css';
import { __ } from '@wordpress/i18n';
import { bell } from '@wordpress/icons';
import NoteList from '../note-list';

const NOTIFICATION_TABS = [
	{ name: 'all', title: __( 'All' ) },
	{ name: 'unread', title: __( 'Unread' ) },
	{ name: 'alerts', title: __( 'Alerts' ) },
];

const NotePanel = () => {
	return (
		<>
			<CardHeader size="small" style={ { paddingBottom: 0 } }>
				<VStack>
					<HStack justify="flex-start">
						<Icon icon={ bell } />
						<Heading level={ 3 } size={ 15 } weight={ 500 }>
							{ __( 'Notifications' ) }
						</Heading>
					</HStack>
					<TabPanel activeClass="is-active" tabs={ NOTIFICATION_TABS } initialTabName="all">
						{ () => null /* Placeholder div since content is rendered elsewhere */ }
					</TabPanel>
				</VStack>
			</CardHeader>
			<div style={ { overflow: 'auto' } }>
				<NoteList />
			</div>
		</>
	);
};

export default NotePanel;
