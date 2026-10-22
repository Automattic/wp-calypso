import { useNavigate, useParams } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, SelectControl } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Tabs } from '@wordpress/ui';
import { Suspense, lazy, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useLocale } from '../app/locale';
import { Card } from '../components/card';
import Grid from '../components/grid';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';

import './style.scss';

const NotificationsInbox = lazy( () => import( '@automattic/notifications/src/inbox' ) );

type ReadFilter = 'all' | 'unread';

function getNoteTypeOptions() {
	return [
		{ value: '', label: __( 'All types' ) },
		{ value: 'comment', label: __( 'Comments' ) },
		{ value: 'comment_like,like', label: __( 'Likes' ) },
		{ value: 'follow', label: __( 'Subscribers' ) },
		{ value: 'reblog', label: __( 'Reblogs' ) },
		{ value: 'automattcher', label: __( 'Mentions' ) },
		{ value: 'new_post', label: __( 'New posts' ) },
	];
}

/**
 * Returns the notes client filter for the read filter and comma-separated note types.
 */
function getFilterName( readFilter: ReadFilter, noteTypes: string ) {
	if ( ! noteTypes ) {
		return readFilter;
	}
	return readFilter === 'unread'
		? ( `types-unread:${ noteTypes }` as const )
		: ( `types:${ noteTypes }` as const );
}

export default function Notifications() {
	const navigate = useNavigate();
	const locale = useLocale();
	const { noteId } = useParams( { strict: false } );
	const isSmallViewport = useViewportMatch( 'large', '<' );
	const [ readFilter, setReadFilter ] = useState< ReadFilter >( 'all' );
	const [ noteTypes, setNoteTypes ] = useState( '' );

	const setSelectedNoteId = ( selectedNoteId: string | undefined ) => {
		if ( selectedNoteId ) {
			navigate( { to: '/notifications/$noteId', params: { noteId: selectedNoteId } } );
		} else {
			navigate( { to: '/notifications' } );
		}
	};

	const renderListPane = ( list: React.ReactNode ) => (
		<Card className="dashboard-notifications__list">
			<Tabs.Root
				className="dashboard-notifications__tabs"
				value={ readFilter }
				onValueChange={ ( value ) => setReadFilter( value === 'unread' ? 'unread' : 'all' ) }
			>
				<VStack spacing={ 3 } className="dashboard-notifications__filters">
					<Tabs.List>
						<Tabs.Tab value="all">{ __( 'All' ) }</Tabs.Tab>
						<Tabs.Tab value="unread">{ __( 'Unread' ) }</Tabs.Tab>
					</Tabs.List>
					<SelectControl
						__next40pxDefaultSize
						label={ __( 'Type' ) }
						hideLabelFromVision
						value={ noteTypes }
						options={ getNoteTypeOptions() }
						onChange={ setNoteTypes }
					/>
				</VStack>
				<Tabs.Panel value="all" className="dashboard-notifications__tab-panel">
					{ list }
				</Tabs.Panel>
				<Tabs.Panel value="unread" className="dashboard-notifications__tab-panel">
					{ list }
				</Tabs.Panel>
			</Tabs.Root>
		</Card>
	);

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					title={ __( 'Notifications' ) }
					actions={
						<Button variant="secondary" __next40pxDefaultSize disabled accessibleWhenDisabled>
							{ __( 'Mark all as read' ) }
						</Button>
					}
				/>
			}
		>
			<Suspense fallback={ null }>
				<NotificationsInbox
					wpcom={ wpcom }
					locale={ locale }
					filterName={ getFilterName( readFilter, noteTypes ) }
					selectedNoteId={ noteId }
					setSelectedNoteId={ setSelectedNoteId }
					renderLayout={ ( { list, detail } ) => {
						const listPane = renderListPane( list );
						const detailPane = detail && (
							<Card className="dashboard-notifications__detail">{ detail }</Card>
						);

						if ( isSmallViewport ) {
							return detailPane || listPane;
						}

						return (
							<Grid gap="md" templateColumns="392px 1fr">
								{ listPane }
								{ detailPane }
							</Grid>
						);
					} }
				/>
			</Suspense>
		</PageLayout>
	);
}
