import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import { useSubscriberRemoveMutation } from './mutations';
import { useSubscribersQuery } from './queries';

type Subscriber = {
	user_id: number;
	subscription_id: number;
	email_address: string;
	plans: {
		paid_subscription_id: number;
	}[];
};

export const Subscribers = () => {
	const isSubscribersPageEnabled = config.isEnabled( 'subscribers-page' );
	const mutate = useSubscriberRemoveMutation( 210703284, 1 );

	const { data } = useSubscribersQuery( 210703284, 1 );

	if ( ! isSubscribersPageEnabled ) {
		return null;
	}

	return (
		<Main>
			<DocumentHead title={ translate( 'Subscribers' ) } />
			Subscribers
			<table>
				<tr>
					<th>email</th>
					<th>plan?</th>
					<th>Unsubscribe</th>
				</tr>
				{ data?.subscribers?.map( ( subscriber: Subscriber ) => (
					<tr key={ subscriber.email_address }>
						<td>{ subscriber.email_address }</td>
						<td>{ subscriber.plans?.length ? 'yes' : 'no' }</td>
						<td>
							<button onClick={ () => mutate.mutate( subscriber ) }>Unsubscribe</button>
						</td>
					</tr>
				) ) }
			</table>
		</Main>
	);
};
