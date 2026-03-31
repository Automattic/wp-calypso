import { Subscriber as SubscriberDataStore } from '@automattic/data-stores';
import { useDispatch as useDataStoreDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryMemberships from 'calypso/components/data/query-memberships';
import QueryMembershipsSettings from 'calypso/components/data/query-memberships-settings';
import Main from 'calypso/components/main';
import SubscriberValidationGate from 'calypso/components/subscribers-validation-gate';
import { useCompleteLaunchpadTaskWithNoticeOnLoad } from 'calypso/launchpad/hooks/use-complete-launchpad-task-with-notice-on-load';
import CompSubscriptionModal from 'calypso/my-sites/subscribers/components/comp-modal/comp-modal';
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

	const [ compUserId, setCompUserId ] = useState< number | string | null >( null );
	const [ compUsername, setCompUsername ] = useState( '' );
	const [ compedPlanIds, setCompedPlanIds ] = useState< number[] >( [] );
	const onCompSubscription = ( { user_id, email_address, display_name, plans }: Subscriber ) => {
		setCompUserId( user_id || email_address || null );
		setCompUsername( display_name );
		setCompedPlanIds(
			( plans ?? [] )
				.filter( ( plan ) => plan.is_comp && plan.subscription_id )
				.map( ( plan ) => plan.subscription_id as number )
		);
	};

	const [ removeComp, setRemoveComp ] = useState< {
		compId?: number;
		planName: string;
		username: string;
	} | null >( null );

	return (
		<>
			<QueryMemberships siteId={ siteId ?? 0 } />
			<QueryMembershipsSettings siteId={ siteId ?? 0 } source="calypso" />
			<Main wideLayout className="subscribers">
				<DocumentHead title={ translate( 'Subscribers' ) } />
				<SubscriberValidationGate siteId={ siteId }>
					<SubscriberDataViews
						siteId={ siteId }
						isUnverified={ isUnverified }
						onCompSubscription={ onCompSubscription }
						onRemoveComp={ ( params ) => setRemoveComp( params ) }
						subscriberId={ isSubscriberIdValid ? subscriberId : undefined }
					/>

					{ compUserId !== null && (
						<CompSubscriptionModal
							siteId={ siteId ?? 0 }
							userId={ compUserId }
							username={ compUsername }
							compedPlanIds={ compedPlanIds }
							onClose={ () => setCompUserId( null ) }
							onConfirm={ () => setCompUserId( null ) }
						/>
					) }

					{ removeComp !== null && (
						<RemoveCompModal
							siteId={ siteId ?? 0 }
							compId={ removeComp.compId }
							planName={ removeComp.planName }
							username={ removeComp.username }
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
