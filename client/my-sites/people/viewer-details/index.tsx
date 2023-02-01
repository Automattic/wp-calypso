import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QuerySiteInvites from 'calypso/components/data/query-site-invites';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import useRemoveViewer from 'calypso/data/viewers/use-remove-viewer-mutation';
import useViewerQuery from 'calypso/data/viewers/use-viewer-query';
import accept from 'calypso/lib/accept';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { deleteInvite } from 'calypso/state/invites/actions';
import { getAcceptedInvitesForSite } from 'calypso/state/invites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { Member } from '../types';
import type { Invite } from 'calypso/my-sites/people/team-invites/types';

interface Props {
	userId: string;
}
export default function ViewerDetails( props: Props ) {
	const __ = useTranslate();
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();

	const { userId } = props;
	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const acceptedInvites = useSelector( ( state ) =>
		getAcceptedInvitesForSite( state, site?.ID as number )
	);
	const [ invite, setInvite ] = useState< Invite >();
	const [ templateState, setTemplateState ] = useState( 'loading' );
	const { data: viewer, isLoading } = useViewerQuery( site?.ID, userId ) as {
		data: Member;
		isLoading: boolean;
	};
	const { removeViewer } = useRemoveViewer();

	useEffect( () => checkTemplateState(), [ viewer ] );
	useEffect( () => findInviteObject(), [ acceptedInvites, viewer ] );

	function findInviteObject() {
		const inv =
			viewer && acceptedInvites && acceptedInvites.find( ( x ) => x.key === viewer.invite_key );

		inv && setInvite( inv );
	}

	function checkTemplateState() {
		if ( isLoading ) {
			setTemplateState( 'loading' );
		} else if ( ! viewer ) {
			setTemplateState( 'not-found' );
		} else {
			setTemplateState( 'default' );
		}
	}

	function onRemove() {
		dispatch( recordGoogleEvent( 'People', 'Clicked Remove Viewer Button On Viewer Details' ) );
		showConfirmDialog();
	}

	function onRemoveAccept() {
		// since we show the full user details with the invite information,
		// the button Remove simultaneously calls, remove the viewer | delete the invite
		viewer && removeViewer( site?.ID, viewer.ID );
		invite && dispatch( deleteInvite( site?.ID, invite.key ) );
		goBack();
	}

	function onBackClick() {
		dispatch( recordGoogleEvent( 'People', 'Clicked Back Button on Viewer Details' ) );
		goBack();
	}

	function showConfirmDialog() {
		accept(
			<div>
				<p>{ __( 'If you remove this viewer, he or she will not be able to visit this site.' ) }</p>
				<p>{ __( 'Would you still like to remove this viewer?' ) }</p>
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
			__( 'Remove', { context: 'Confirm Remove viewer button text.' } )
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

			<FormattedHeader
				brandFont
				className="people__page-heading"
				headerText={ __( 'Users' ) }
				subHeaderText={ __( 'People who have subscribed to your site and team members.' ) }
				align="left"
				hasScreenOptions
			/>

			<HeaderCake isCompact onClick={ onBackClick }>
				{ __( 'User Details' ) }
			</HeaderCake>

			{ templateState === 'loading' && (
				<Card>
					<PeopleListItem key="people-list-item-placeholder" />
				</Card>
			) }

			{ templateState === 'not-found' && (
				<EmptyContent title={ __( 'The requested subscriber does not exist.' ) } />
			) }

			{ templateState === 'default' && (
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
									<strong>{ __( 'Status' ) }</strong>
									<div>
										<span className="people-member-details__meta-status-active">
											{ __( 'Active' ) }
										</span>
									</div>
								</div>
							) }

							{ invite?.invitedBy && (
								<div className="people-invite-details__meta-item">
									<strong>{ __( 'Added By' ) }</strong>
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
									<strong>{ __( 'Viewer since' ) }</strong>
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
