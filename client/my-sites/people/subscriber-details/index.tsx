import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import FormattedHeader from 'calypso/components/formatted-header';
import HeaderCake from 'calypso/components/header-cake';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import Main from 'calypso/components/main';
import useFollowerQuery from 'calypso/data/followers/use-follower-query';
import useRemoveFollowerMutation from 'calypso/data/followers/use-remove-follower-mutation';
import accept from 'calypso/lib/accept';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PeopleListItem from 'calypso/my-sites/people/people-list-item';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { Member } from '../types';

import './style.scss';

interface Props {
	subscriberId: string;
	subscriberType: string;
}
export default function SubscriberDetails( props: Props ) {
	const _ = useTranslate();
	const moment = useLocalizedMoment();
	const dispatch = useDispatch();
	const { removeFollower, isSuccess: isRemoveFollowerSuccess } = useRemoveFollowerMutation();

	const site = useSelector( ( state ) => getSelectedSite( state ) );
	const { subscriberId, subscriberType } = props;
	const [ templateState, setTemplateState ] = useState( 'loading' );
	const { data: subscriber, isLoading } = useFollowerQuery(
		site?.ID,
		subscriberId,
		subscriberType
	);

	useEffect( () => checkTemplateState(), [ subscriber, isLoading ] );
	useEffect( () => checkRemoveCompletion(), [ isRemoveFollowerSuccess ] );

	function checkTemplateState() {
		if ( isLoading ) {
			setTemplateState( 'loading' );
		} else if ( ! subscriber ) {
			setTemplateState( 'not-found' );
		} else {
			setTemplateState( 'default' );
		}
	}

	function checkRemoveCompletion() {
		if ( isRemoveFollowerSuccess ) {
			goBack();
		}
	}

	function onRemove() {
		subscriber && removeSubscriber( subscriber );
	}

	function onBackClick() {
		dispatch( recordGoogleEvent( 'People', 'Clicked Back Button on Subscriber Details' ) );
		goBack();
	}

	function goBack() {
		const fallback = site?.slug ? '/people/subscribers/' + site.slug : '/people/subscribers/';

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore: There are no type definitions for page.back.
		page.back( fallback );
	}

	function removeSubscriber( subscriber: Member ) {
		const listType = 'email' === subscriberType ? 'Email Follower' : 'Follower';
		dispatch(
			recordGoogleEvent( 'People', 'Clicked Remove Follower Button On ' + listType + ' list' )
		);

		accept(
			<div>
				<p>
					{ subscriberType === 'wpcom' &&
						_(
							'Removing followers makes them stop receiving updates from your site. ' +
								'If they choose to, they can still visit your site, and follow it again.'
						) }
					{ subscriberType === 'email' &&
						_( 'Removing email subscribers makes them stop receiving updates from your site.' ) }
				</p>
			</div>,
			( accepted: boolean ) => {
				if ( accepted ) {
					dispatch(
						recordGoogleEvent(
							'People',
							'Clicked Remove Button In Remove ' + listType + ' Confirmation'
						)
					);
					removeFollower( site?.ID, subscriberType, subscriber.ID );
				} else {
					dispatch(
						recordGoogleEvent(
							'People',
							'Clicked Cancel Button In Remove ' + listType + ' Confirmation'
						)
					);
				}
			},
			_( 'Remove', { context: 'Confirm Remove follower button text.' } )
		);
	}

	return (
		<Main className="people-member-details">
			<PageViewTracker path="/people/subscribers/:site/:id" title="People > User Details" />

			<FormattedHeader
				brandFont
				className="people__page-heading"
				headerText={ _( 'Users' ) }
				subHeaderText={ _( 'People who have subscribed to your site and team members.' ) }
				align="left"
				hasScreenOptions
			/>

			<HeaderCake isCompact onClick={ onBackClick }>
				{ _( 'User Details' ) }
			</HeaderCake>

			{ templateState === 'loading' && (
				<Card>
					<PeopleListItem key="people-list-item-placeholder" />
				</Card>
			) }

			{ templateState === 'not-found' && (
				<EmptyContent title={ _( 'The requested subscriber does not exist.' ) } />
			) }

			{ templateState === 'default' && (
				<Card className="member-details">
					<PeopleListItem
						key={ `subscriber-details-${ subscriberId }` }
						site={ site }
						user={ subscriber }
						onRemove={ onRemove }
					/>
					<div className="people-member-details__meta">
						{ subscriber?.date_subscribed && (
							<div className="people-member-details__meta-item">
								<strong>{ _( 'Status' ) }</strong>
								<div>
									<span className="people-member-details__meta-status-active">
										{ _( 'Active' ) }
									</span>
								</div>
							</div>
						) }

						{ subscriber?.date_subscribed && (
							<div className="people-member-details__meta-item">
								<strong>{ _( 'Subscriber since' ) }</strong>
								<div>
									<span>{ moment( subscriber?.date_subscribed ).format( 'LLL' ) }</span>
								</div>
							</div>
						) }

						{ subscriber?.url && (
							<div className="people-member-details__meta-item">
								<strong>{ _( 'Source' ) }</strong>
								<div>
									<span>{ subscriber.url }</span>
								</div>
							</div>
						) }
					</div>
				</Card>
			) }
		</Main>
	);
}
