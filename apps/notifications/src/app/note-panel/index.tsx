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
import { useEffect, useRef, useState } from 'react';
import { getFilters } from '../../panel/templates/filters';
import NoteList from '../note-list';
import NotePanelActions from './actions';

type ActiveTab = keyof ReturnType< typeof getFilters >;

const NOTIFICATION_TABS = Object.values( getFilters() ).map( ( { name, label } ) => ( {
	name,
	title: label,
} ) );

const NotePanel = () => {
	const [ activeTab, setActiveTab ] = useState< ActiveTab >( 'all' );

	// Ensure the component is focused on mount
	// to avoid parent's <Popover>'s focus trap from moving.
	const focusRef = useRef< HTMLDivElement >( null );
	useEffect( () => {
		focusRef.current?.focus();
	}, [] );

	return (
		<div ref={ focusRef } tabIndex={ -1 }>
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
							setActiveTab( tabName as ActiveTab );
						} }
					>
						{ () => null /* Placeholder div since content is rendered elsewhere */ }
					</TabPanel>
				</VStack>
			</CardHeader>
			<NoteList filterName={ activeTab } />
		</div>
	);
};

export default NotePanel;
