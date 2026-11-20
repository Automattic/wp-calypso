import config from '@automattic/calypso-config';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { VisuallyHidden } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { Suspense, lazy, useEffect, useState } from 'react';
import wpcom from 'calypso/lib/wp';
import { useAnalytics } from '../app/analytics';
import { useConsumeSearchParams } from '../app/hooks/use-consume-search-params';
import { useLocale } from '../app/locale';
import { notificationsRoute } from '../app/router/notifications';
import { Card } from '../components/card';
import EmptyState from '../components/empty-state';
import { Notice, NoticeActionLink } from '../components/notice';
import PageLayout from '../components/page-layout';

import './style.scss';

const NotificationsInbox = lazy( () => import( '@automattic/notifications/src/inbox' ) );

const FEEDBACK_URL = 'https://wp.me/p9zg7s-eO';

export default function Notifications() {
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();
	const locale = useLocale();
	const { filter } = notificationsRoute.useSearch();
	const handedOffNoteId = useRouterState( {
		select: ( state ) => state.location.state.notificationsNoteId,
	} );
	// A panel outside the Dashboard opens this page in a new tab, where there is no history entry to hand its note over in.
	const { note: linkedNote } = useConsumeSearchParams( [ 'note' ] );
	// The inbox matches the selection to loaded notes by their ID as text, so `042` would never match note 42.
	const linkedNoteId = linkedNote && /^[1-9]\d*$/.test( linkedNote ) ? linkedNote : undefined;
	const [ noteId, setSelectedNoteId ] = useState( handedOffNoteId ?? linkedNoteId );
	const isSmallViewport = useViewportMatch( 'large', '<' );

	useEffect( () => {
		if ( handedOffNoteId ) {
			navigate( { to: notificationsRoute.fullPath, search: true, state: {}, replace: true } );
		}
	}, [ handedOffNoteId, navigate ] );

	const setFilterName = ( filterName: string ) => {
		setSelectedNoteId( undefined );
		navigate( {
			to: notificationsRoute.fullPath,
			search: { filter: filterName === 'all' ? undefined : filterName },
			replace: true,
		} );
	};

	return (
		<PageLayout size="large">
			<div className="dashboard-notifications-page">
				<Notice
					title={ __( 'This page is a work in progress' ) }
					actions={
						<NoticeActionLink
							href={ FEEDBACK_URL }
							openInNewTab
							rel="noopener noreferrer"
							onClick={ () =>
								recordTracksEvent( 'calypso_dashboard_notifications_inbox_feedback_click' )
							}
						>
							{ __( 'Leave feedback' ) }
						</NoticeActionLink>
					}
				>
					{ __(
						'Some things are missing and others may change. Your feedback helps us shape it.'
					) }
				</Notice>
				<div className="dashboard-notifications-page__inbox">
					<Suspense fallback={ null }>
						<NotificationsInbox
							wpcom={ wpcom }
							locale={ locale }
							filterName={ filter }
							setFilterName={ setFilterName }
							selectedNoteId={ noteId }
							setSelectedNoteId={ setSelectedNoteId }
							onViewSettings={ () => navigate( { to: '/me/notifications' } ) }
							isMarkAsUnreadEnabled={ config.isEnabled( 'notifications/mark-as-unread' ) }
							renderLayout={ ( { list, detail } ) => {
								const listPane = (
									<div className="dashboard-notifications-inbox__list">{ list }</div>
								);
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
											<>
												{ detailPane && (
													<VisuallyHidden as="h1">{ __( 'Notifications' ) }</VisuallyHidden>
												) }
												{ detailPane || listPane }
											</>
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
				</div>
			</div>
		</PageLayout>
	);
}
