import { useNavigate, useParams } from '@tanstack/react-router';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Tabs } from '@wordpress/ui';
import { Suspense, lazy, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useAuth } from '../app/auth';
import { useLocale } from '../app/locale';
import { Card } from '../components/card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';

import './style.scss';

const NotificationsInbox = lazy( () => import( '@automattic/notifications/src/inbox' ) );

type ReadFilter = 'all' | 'unread';

export default function Notifications() {
	const navigate = useNavigate();
	const locale = useLocale();
	const { user } = useAuth();
	const { noteId } = useParams( { strict: false } );
	const isSmallViewport = useViewportMatch( 'large', '<' );
	const [ readFilter, setReadFilter ] = useState< ReadFilter >( 'all' );

	const setSelectedNoteId = ( selectedNoteId: string | undefined ) => {
		if ( selectedNoteId ) {
			navigate( { to: '/notifications/$noteId', params: { noteId: selectedNoteId } } );
		} else {
			navigate( { to: '/notifications' } );
		}
	};

	const renderListPane = ( list: React.ReactNode ) => (
		<div className="dashboard-notifications__list">
			<Tabs.Root
				className="dashboard-notifications__tabs"
				value={ readFilter }
				onValueChange={ ( value ) => setReadFilter( value === 'unread' ? 'unread' : 'all' ) }
			>
				<Tabs.List className="dashboard-notifications__tab-list">
					<Tabs.Tab value="all">{ __( 'All' ) }</Tabs.Tab>
					<Tabs.Tab value="unread">{ __( 'Unread' ) }</Tabs.Tab>
				</Tabs.List>
				<div className="dashboard-notifications__list-actions">
					<Button variant="tertiary" size="small">
						{ __( 'Mark all as read' ) }
					</Button>
				</div>
				<Tabs.Panel value="all" className="dashboard-notifications__tab-panel">
					{ list }
				</Tabs.Panel>
				<Tabs.Panel value="unread" className="dashboard-notifications__tab-panel">
					{ list }
				</Tabs.Panel>
			</Tabs.Root>
		</div>
	);

	return (
		<PageLayout size="large" header={ <PageHeader title={ __( 'Notifications' ) } /> }>
			<Suspense fallback={ null }>
				<NotificationsInbox
					wpcom={ wpcom }
					locale={ locale }
					currentUser={ { name: user.display_name, avatarUrl: user.avatar_URL } }
					filterName={ readFilter }
					selectedNoteId={ noteId }
					setSelectedNoteId={ setSelectedNoteId }
					renderLayout={ ( { list, detail } ) => {
						const listPane = renderListPane( list );
						const detailPane = detail && (
							<div className="dashboard-notifications__detail">{ detail }</div>
						);

						return (
							<Card className="dashboard-notifications">
								{ isSmallViewport ? (
									detailPane || listPane
								) : (
									<div className="dashboard-notifications__panes">
										{ listPane }
										{ detailPane }
									</div>
								) }
							</Card>
						);
					} }
				/>
			</Suspense>
		</PageLayout>
	);
}
