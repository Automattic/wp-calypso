import { Subscriber as SubscriberDataStore } from '@automattic/data-stores';
import { useDispatch as useDataStoreDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import Main from 'calypso/components/main';
import SubscriberValidationGate from 'calypso/components/subscribers-validation-gate';
import { useCompleteLaunchpadTaskWithNoticeOnLoad } from 'calypso/launchpad/hooks/use-complete-launchpad-task-with-notice-on-load';
import GiftSubscriptionModal from 'calypso/my-sites/subscribers/components/gift-modal/gift-modal';
import { SubscriberDataViews } from 'calypso/my-sites/subscribers/components/subscriber-data-views';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Subscriber } from './types';

/**
 * Props for the SubscribersPage component
 */
type Props = {
	/**
	 * The ID of the subscriber to display details for.
	 * When provided and valid, shows the subscriber details view.
	 * Should be a numeric string matching the subscriber's subscription_id.
	 */
	subscriberId?: string;
};

/**
 * Renders the subscribers management page.
 * Handles both the subscribers list view and individual subscriber details view.
 * The view is determined by the presence of a valid subscriberId in the URL.
 * @param {Props} props - Component properties
 * @param {string} [props.subscriberId] - Optional subscriber ID from URL parameters
 */
const SubscribersPage = ( { subscriberId }: Props ) => {
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId ) ?? null;
	const isSubscriberIdValid = subscriberId && /^\d+$/.test( subscriberId );

	const initiallyLoadedWithTaskCompletionHash = useRef(
		window.location.hash === '#building-your-audience-task'
	);
	useCompleteLaunchpadTaskWithNoticeOnLoad( {
		enabled: initiallyLoadedWithTaskCompletionHash.current,
		taskSlug: 'start_building_your_audience',
		noticeId: 'subscribers-page-visited',
		noticeText: translate( 'Explored subscriber settings' ),
	} );

	const importSelector = useSelect(
		( select ) => select( SubscriberDataStore.store ).getImportSubscribersSelector(),
		[]
	);
	const { getSubscribersImports } = useDataStoreDispatch( SubscriberDataStore.store );
	const isUnverified = importSelector?.error?.code === 'unverified_email';
	useEffect( () => {
		if ( siteId ) {
			getSubscribersImports( siteId );
		}
	}, [ siteId, getSubscribersImports ] );

	const [ giftUserId, setGiftUserId ] = useState( 0 );
	const [ giftUsername, setGiftUsername ] = useState( '' );
	const onGiftSubscription = ( { user_id, display_name }: Subscriber ) => {
		setGiftUserId( user_id );
		setGiftUsername( display_name );
	};

	return (
		<>
			<QueryMembershipsSettings siteId={ siteId ?? 0 } source="calypso" />
			<Main wideLayout className="subscribers">
				<DocumentHead title={ translate( 'Subscribers' ) } />
				<SubscriberValidationGate siteId={ siteId }>
					<SubscriberDataViews
						siteId={ siteId }
						isUnverified={ isUnverified }
						onGiftSubscription={ onGiftSubscription }
						subscriberId={ isSubscriberIdValid ? subscriberId : undefined }
					/>

					{ giftUserId !== 0 && (
						<GiftSubscriptionModal
							siteId={ siteId ?? 0 }
							userId={ giftUserId }
							username={ giftUsername }
							onCancel={ () => setGiftUserId( 0 ) }
							onConfirm={ () => setGiftUserId( 0 ) }
						/>
					) }
				</SubscriberValidationGate>
			</Main>
		</>
	);
};

export default SubscribersPage;
