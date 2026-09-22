import page from '@automattic/calypso-router';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import QuerySiteInvites from 'calypso/components/data/query-site-invites';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import useRemoveViewer from 'calypso/data/viewers/use-remove-viewer-mutation';
import useViewerQuery from 'calypso/data/viewers/use-viewer-query';
import accept from 'calypso/lib/accept';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { useDispatch, useSelector } from 'calypso/state';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { deleteInvite } from 'calypso/state/invites/actions';
import { getAcceptedInvitesForSite } from 'calypso/state/invites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { Member } from '@automattic/data-stores';

interface Props {
	userId: string;
}
export default function ViewerDetails( props: Props ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();

	const { userId } = props;
	const site = useSelector( getSelectedSite );
	const acceptedInvites = useSelector( ( state ) =>
		getAcceptedInvitesForSite( state, site?.ID as number )
	);
	const { data: viewer, isLoading } = useViewerQuery( site?.ID, userId ) as {
		data: Member;
		isLoading: boolean;
	};
	const { removeViewer } = useRemoveViewer();
	const invite = viewer && acceptedInvites?.find( ( entry ) => entry.key === viewer.invite_key );

	function onRemove() {
		dispatch( recordGoogleEvent( 'People', 'Clicked Remove Viewer Button On Viewer Details' ) );
		showConfirmDialog();
	}

	function onRemoveAccept() {
		// since we show the full user details with the invite information,
		// the button Remove simultaneously calls, remove the viewer | delete the invite
		if ( viewer ) {
			removeViewer( site?.ID, viewer.ID );
		}
		if ( invite ) {
			dispatch( deleteInvite( site?.ID, invite.key ) );
		}
		goBack();
	}

	function onBackClick() {
		dispatch( recordGoogleEvent( 'People', 'Clicked Back Button on Viewer Details' ) );
		goBack();
	}

	function showConfirmDialog() {
		accept(
			<div>
				<p>
					{ translate( 'If you remove this viewer, they will not be able to visit this site.' ) }
				</p>
				<p>{ translate( 'Would you still like to remove them?' ) }</p>
			</div>,
			( accepted: boolean ) => {
				if ( accepted ) {
					dispatch(
						recordGoogleEvent( 'People', 'Clicked Remove Button In Remove Viewer Confirmation' )
					);
					onRemoveAccept();
				} else {
					dispatch(
						recordGoogleEvent( 'People', 'Clicked Cancel Button In Remove Viewer Confirmation' )
					);
				}
			},
			translate( 'Remove', { context: 'Confirm Remove viewer button text.' } )
		);
	}

	function goBack() {
		const fallback = site?.slug ? '/people/team/' + site.slug : '/people/team/';

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore: There are no type definitions for page.back.
		page.back( fallback );
	}

	return (
		<Main className="people-member-details">
			<PageViewTracker path="/people/viewers/:site/:id" title="People > User Details" />
			{ site?.ID && <QuerySiteInvites siteId={ site?.ID } /> }

			<HeaderCake isCompact onClick={ onBackClick }>
				{ translate( 'User Details' ) }
			</HeaderCake>

			{ isLoading && (
				<Card>
					<PeopleListItem key="people-list-item-placeholder" />
				</Card>
			) }

			{ ! isLoading && ! viewer && (
				<EmptyContent title={ translate( 'The requested subscriber does not exist.' ) } />
			) }

			{ ! isLoading && viewer && (
				<Card className="member-details">
					<PeopleListItem
						key={ `viewer-details-${ viewer.ID }` }
						site={ site }
						user={ viewer }
						type="viewer"
						clickableItem={ false }
						onRemove={ onRemove }
					/>
					{ invite && (
						<div className="people-member-details__meta">
							{ invite?.acceptedDate && (
								<div className="people-member-details__meta-item">
									<strong>{ translate( 'Status' ) }</strong>
									<div>
										<span className="people-member-details__meta-status-active">
											{ translate( 'Active' ) }
										</span>
									</div>
								</div>
							) }

							{ invite?.invitedBy && (
								<div className="people-invite-details__meta-item">
									<strong>{ translate( 'Added By' ) }</strong>
									<div>
										<span>
											{ invite.invitedBy.name !== invite.invitedBy.login && (
												<>{ invite.invitedBy.name }</>
											) }
											&nbsp;
											{ '@' + invite.invitedBy.login }
										</span>
									</div>
								</div>
							) }

							{ invite?.acceptedDate && (
								<div className="people-member-details__meta-item">
									<strong>{ translate( 'Viewer since' ) }</strong>
									<div>
										<span>{ moment( invite?.acceptedDate ).format( 'LLL' ) }</span>
									</div>
								</div>
							) }
						</div>
					) }
				</Card>
			) }
		</Main>
	);
}
