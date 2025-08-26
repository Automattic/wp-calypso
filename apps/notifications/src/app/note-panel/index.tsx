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
import { useState } from 'react';
import Filters from '../../panel/templates/filters';
import NoteList from '../note-list';
import NotePanelActions from './actions';

const NOTIFICATION_TABS = Object.values( Filters ).map( ( { name, label } ) => ( {
	name,
	title: label,
} ) );

const NotePanel = () => {
	const [ activeTab, setActiveTab ] = useState< keyof typeof Filters >( 'all' );
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
						initialTabName={ activeTab }
						onSelect={ ( tabName ) => {
							setActiveTab( tabName as keyof typeof Filters );
						} }
					>
						{ () => null /* Placeholder div since content is rendered elsewhere */ }
					</TabPanel>
				</VStack>
			</CardHeader>
			<NoteList filterName={ activeTab } />
		</>
	);
};

export default NotePanel;
