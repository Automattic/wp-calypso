import { Subscriber as SubscriberDataStore } from '@automattic/data-stores';
import { useDispatch as useDataStoreDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useBlogStickersQuery } from 'calypso/blocks/blog-stickers/use-blog-stickers-query';
import DocumentHead from 'calypso/components/data/document-head';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import Main from 'calypso/components/main';
import SubscriberValidationGate from 'calypso/components/subscribers-validation-gate';
import { useCompleteLaunchpadTaskWithNoticeOnLoad } from 'calypso/launchpad/hooks/use-complete-launchpad-task-with-notice-on-load';
import GiftSubscriptionModal from 'calypso/my-sites/subscribers/components/gift-modal/gift-modal';
import RemoveCompModal from 'calypso/my-sites/subscribers/components/remove-comp-modal/remove-comp-modal';
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

	const { data: blogStickers = [] } = useBlogStickersQuery( siteId );
	const useComps = blogStickers.includes( 'complimentary-memberships' );

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

	const [ giftUserId, setGiftUserId ] = useState< number | string | null >( null );
	const [ giftUsername, setGiftUsername ] = useState( '' );
	const onGiftSubscription = ( { user_id, email_address, display_name }: Subscriber ) => {
		setGiftUserId( user_id || email_address || null );
		setGiftUsername( display_name );
	};

	const [ removeComp, setRemoveComp ] = useState< {
		giftId?: number;
		compId?: number;
		planName: string;
		username: string;
	} | null >( null );

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
						onRemoveComp={ ( params ) => setRemoveComp( params ) }
						subscriberId={ isSubscriberIdValid ? subscriberId : undefined }
					/>

					{ giftUserId !== null && (
						<GiftSubscriptionModal
							siteId={ siteId ?? 0 }
							userId={ giftUserId }
							username={ giftUsername }
							useComps={ useComps }
							onClose={ () => setGiftUserId( null ) }
							onConfirm={ () => setGiftUserId( null ) }
						/>
					) }

					{ removeComp !== null && (
						<RemoveCompModal
							siteId={ siteId ?? 0 }
							giftId={ removeComp.giftId }
							compId={ removeComp.compId }
							planName={ removeComp.planName }
							username={ removeComp.username }
							useComps={ useComps }
							onClose={ () => setRemoveComp( null ) }
							onRemoved={ () => setRemoveComp( null ) }
						/>
					) }
				</SubscriberValidationGate>
			</Main>
		</>
	);
};

export default SubscribersPage;
