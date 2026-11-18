import { useNavigate, useParams } from '@tanstack/react-router';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Tabs } from '@wordpress/ui';
import { Suspense, lazy } from 'react';
import wpcom from 'calypso/lib/wp';
import { useLocale } from '../app/locale';
import { notificationRoute, notificationsRoute } from '../app/router/notifications';
import { Card } from '../components/card';
import EmptyState from '../components/empty-state';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';

import './style.scss';

const NotificationsInbox = lazy( () => import( '@automattic/notifications/src/inbox' ) );

export default function Notifications() {
	const navigate = useNavigate();
	const locale = useLocale();
	const { noteId } = useParams( { strict: false } );
	const { filter: readFilter = 'all' } = notificationsRoute.useSearch();
	const isSmallViewport = useViewportMatch( 'large', '<' );

	const setSelectedNoteId = ( selectedNoteId: string | undefined ) => {
		if ( selectedNoteId ) {
			navigate( {
				to: notificationRoute.fullPath,
				params: { noteId: selectedNoteId },
				search: true,
				replace: !! noteId,
			} );
		} else {
			navigate( { to: notificationsRoute.fullPath, search: true } );
		}
	};

	const setReadFilter = ( value: string | null ) => {
		navigate( {
			to: '.',
			search: { filter: value === 'unread' ? 'unread' : undefined },
			replace: true,
		} );
	};

	const renderListPane = ( list: React.ReactNode ) => (
		<div className="dashboard-notifications-inbox__list">
			<Tabs.Root
				className="dashboard-notifications-inbox__tabs"
				value={ readFilter }
				onValueChange={ setReadFilter }
			>
				<Tabs.List className="dashboard-notifications-inbox__tab-list" variant="minimal">
					<Tabs.Tab value="all">{ __( 'All' ) }</Tabs.Tab>
					<Tabs.Tab value="unread">{ __( 'Unread' ) }</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel value="all" className="dashboard-notifications-inbox__tab-panel">
					{ list }
				</Tabs.Panel>
				<Tabs.Panel value="unread" className="dashboard-notifications-inbox__tab-panel">
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
					filterName={ readFilter }
					selectedNoteId={ noteId }
					setSelectedNoteId={ setSelectedNoteId }
					renderLayout={ ( { list, detail } ) => {
						const listPane = renderListPane( list );
						const detailPane = detail && (
							<div className="dashboard-notifications-inbox__detail">{ detail }</div>
						);
						const emptyDetailPane = ! noteId && (
							<div className="dashboard-notifications-inbox__detail is-empty">
								<EmptyState>
									<EmptyState.Header>
										<EmptyState.Title>{ __( 'No notification selected' ) }</EmptyState.Title>
										<EmptyState.Description>
											{ __( 'Select a notification from the list to read it here.' ) }
										</EmptyState.Description>
									</EmptyState.Header>
								</EmptyState>
							</div>
						);

						return (
							<Card className="dashboard-notifications-inbox">
								{ isSmallViewport ? (
									detailPane || listPane
								) : (
									<div className="dashboard-notifications-inbox__panes">
										{ listPane }
										{ detailPane || emptyDetailPane }
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
