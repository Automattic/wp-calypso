import page from '@automattic/calypso-router';
import { Gravatar } from '@automattic/components';
import { HelpCenter } from '@automattic/data-stores';
import { Locale, useLocalizeUrl } from '@automattic/i18n-utils';
import { useBreakpoint } from '@automattic/viewport-react';
import { Page } from '@wordpress/admin-ui';
import { Button, Icon } from '@wordpress/components';
import { useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { DataViews, type View, type ViewTable, type Action, Operator } from '@wordpress/dataviews';
import { useMemo, useState, useCallback, useEffect } from '@wordpress/element';
import { plus, trash } from '@wordpress/icons';
import { fixMe, translate } from 'i18n-calypso';
import JetpackTitle from 'calypso/components/jetpack-title';
import { useSubscribedNewsletterCategories } from 'calypso/data/newsletter-categories';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { Product } from 'calypso/my-sites/earn/types';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import { isSimpleSite, getSiteSlug } from 'calypso/state/sites/selectors';
import { SubscribersFilterBy, SubscribersSortBy, SubscribersStatus } from '../../constants';
import { getSubscriptionIdFromSubscriber } from '../../helpers';
import {
	useAddSubscribersCallback,
	useMigrateSubscribersCallback,
	useSubscriptionPlans,
	useUnsubscribeModal,
} from '../../hooks';
import {
	useSubscribersQuery,
	useSubscriberCountQuery,
	useSubscriberDetailsQuery,
} from '../../queries';
import {
	useRecordSubscriberClicked,
	useRecordSubscriberSearch,
	useRecordSubscriberFilter,
	useRecordSubscriberSort,
} from '../../tracks';
import { Subscriber } from '../../types';
import { AddSubscribersModal } from '../add-subscribers-modal';
import { JetpackEmptyListView } from '../jetpack-empty-list-view';
import { MigrateSubscribersModal } from '../migrate-subscribers-modal';
import { SubscriberDetails } from '../subscriber-details';
import { SubscriberDetailsSkeleton } from '../subscriber-details/skeleton';
import { SubscriberLaunchpad } from '../subscriber-launchpad';
import SubscriberTotals from '../subscriber-totals';
import { SubscribersHeaderPopover } from '../subscribers-header-popover';
import { UnsubscribeModal } from '../unsubscribe-modal';
import './style.scss';

enum SubscriberModalType {
	NONE = 'none',
	ADD = 'add',
	MIGRATE = 'migrate',
}

const HELP_CENTER_STORE = HelpCenter.register();

type SubscriberDataViewsProps = {
	siteId: number | null;
	isUnverified: boolean;
	onCompSubscription: ( subscriber: Subscriber ) => void;
	onRemoveComp: ( params: { planName: string; username: string; compId?: number } ) => void;
	subscriberId?: string;
};

const SubscriptionTypeCell = ( { subscriber }: { subscriber: Subscriber } ) => {
	const plans = useSubscriptionPlans( subscriber );

	// If there's a paid (non-comp, non-free) plan, show only that.
	const paidPlans = plans.filter( ( p ) => ! p.is_complimentary && ! p.is_free );
	if ( paidPlans.length > 0 ) {
		return paidPlans.map( ( plan, index ) => <div key={ index }>{ plan.plan }</div> );
	}

	// If there are any comps, show just "Comp" (no title details).
	const hasComp = plans.some( ( p ) => p.is_complimentary );
	if ( hasComp ) {
		return (
			<div>
				{ translate( 'Comp', {
					comment: 'Short for "complimentary" — a free subscription granted by the site creator',
				} ) }
			</div>
		);
	}

	// Otherwise show "Free".
	return <div>{ translate( 'Free' ) }</div>;
};

const SubscriberName = ( { displayName, email }: { displayName: string; email: string } ) => (
	<div className="subscriber-profile subscriber-profile--compact">
		<div className="subscriber-profile__user-details">
			<span className="subscriber-profile__name">{ displayName }</span>
			{ email !== displayName && <span className="subscriber-profile__email">{ email }</span> }
		</div>
	</div>
);

const getFormattedSubscriptionDate = ( subscriber: Subscriber, locale: Locale = 'en-US' ) => {
	// The timestamp returned is UTC, but there is no timezone label adding the gmt offset to help with conversion.
	const subscribedDate =
		( subscriber.wpcom_date_subscribed || subscriber.email_date_subscribed ) + '+00:00';

	// Format - May 5, 2025
	return new Date( subscribedDate ).toLocaleDateString( locale, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	} );
};

const getSubscriptionId = ( subscriber: Subscriber ): number => {
	return Number( getSubscriptionIdFromSubscriber( subscriber ) );
};

const getSubscriptionIdString = ( subscriber: Subscriber ): string => {
	return String( getSubscriptionIdFromSubscriber( subscriber ) );
};

const findRemovableComp = ( subscriber: Subscriber ) =>
	( subscriber.plans ?? [] ).find( ( p ) => p.is_comp && p.comp_id );

const defaultView: ViewTable = {
	type: 'table',
	titleField: 'name',
	mediaField: 'media',
	showTitle: true,
	showMedia: true,
	fields: [ 'plan', 'subscription_status', 'date_subscribed' ],
	layout: {
		styles: {
			media: { width: '60px' },
			name: { width: '55%', minWidth: '195px' },
			plan: { width: '15%' },
			subscription_status: { width: '15%' },
			date_subscribed: { width: '15%' },
		},
	},
};

export default function SubscriberDataViews( {
	siteId,
	onCompSubscription,
	onRemoveComp,
	isUnverified,
	subscriberId,
}: SubscriberDataViewsProps ) {
	const isMobile = useBreakpoint( '<660px' );
	const recordSubscriberClicked = useRecordSubscriberClicked();
	const recordSubscriberSearch = useRecordSubscriberSearch();
	const recordSubscriberFilter = useRecordSubscriberFilter();
	const recordSubscriberSort = useRecordSubscriberSort();
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const isSimple = useSelector( ( state ) => isSimpleSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isAtomicSite( state, siteId ) );
	const isStaging = useSelector( ( state ) => isSiteWpcomStaging( state, siteId ) );
	const locale = useSelector( getCurrentUserLocale );

	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ filters, setFilters ] = useState< SubscribersFilterBy[] >( [ SubscribersFilterBy.All ] );
	const [ selectedSubscriber, setSelectedSubscriber ] = useState< Subscriber | null >( null );

	const products: Product[] = useSelector( ( state ) => getProductsForSiteId( state, siteId ) );

	const hasUncompedPlans = useCallback(
		( subscriber: Subscriber ) => {
			if ( ! products?.length ) {
				return false;
			}
			const compedIds = ( subscriber.plans ?? [] )
				.filter( ( p ) => p.is_comp && p.subscription_id )
				.map( ( p ) => p.subscription_id );
			return products.some( ( product ) => ! compedIds.includes( product.ID ?? 0 ) );
		},
		[ products ]
	);

	const [ currentView, setCurrentView ] = useState< View >( {
		...defaultView,
		page: 1,
		perPage: 10,
		sort: {
			field: SubscribersSortBy.DateSubscribed,
			direction: 'desc',
		},
	} );

	// Header: support link and add/migrate modals
	const localizeUrl = useLocalizeUrl();
	const { setShowSupportDoc } = useDataStoreDispatch( HELP_CENTER_STORE );
	const isWPCOMSite = useSelector( ( state ) => isSiteWPCOM( state, siteId ) );
	const supportUrl = ! isWPCOMSite
		? 'https://jetpack.com/support/newsletter/customize-the-newsletter-experience/#manage-subscribers'
		: 'https://wordpress.com/support/subscribers/ ';

	const openHelpCenter = () => {
		setShowSupportDoc( localizeUrl( supportUrl ) );
	};

	const addSubscribersCallback = useAddSubscribersCallback( siteId );
	const migrateSubscribersCallback = useMigrateSubscribersCallback( siteId );
	const [ showSubscriberModal, setShowSubscriberModal ] = useState< SubscriberModalType >(
		SubscriberModalType.NONE
	);
	const [ initialMethod, setInitialMethod ] = useState( '' );
	const closeSubscriberModal = () => {
		setShowSubscriberModal( SubscriberModalType.NONE );
		setInitialMethod( '' );

		if ( window.location.hash.startsWith( '#add-subscribers' ) ) {
			history.pushState( '', document.title, window.location.pathname + window.location.search );
		}
	};

	useEffect( () => {
		const handleHashChange = () => {
			const hash = window.location.hash;
			if ( hash.startsWith( '#add-subscribers' ) ) {
				const method = new URLSearchParams( hash.replace( '#add-subscribers', '' ) ).get(
					'method'
				);
				setShowSubscriberModal( SubscriberModalType.ADD );
				if ( method ) {
					setInitialMethod( method );
				}
			}
		};

		window.addEventListener( 'hashchange', handleHashChange );
		handleHashChange();

		return () => {
			window.removeEventListener( 'hashchange', handleHashChange );
		};
	}, [] );

	const { data: subscribersQueryResult, isLoading } = useSubscribersQuery( {
		siteId: siteId ?? null,
		page: currentView.page,
		perPage: currentView.perPage,
		search: searchTerm,
		sortTerm: currentView.sort?.field as SubscribersSortBy,
		sortOrder: currentView.sort?.direction as 'asc' | 'desc',
		filters: filters,
	} );

	const {
		currentSubscribers,
		onSetUnsubscribers: handleUnsubscribe,
		onConfirmModal,
		resetSubscribers,
	} = useUnsubscribeModal(
		siteId ?? null,
		{
			page: currentView.page ?? 1,
			perPage: currentView.perPage,
			search: searchTerm,
			sortTerm: currentView.sort?.field as SubscribersSortBy,
			sortOrder: currentView.sort?.direction as 'asc' | 'desc',
			filters: filters,
		},
		false,
		() => {
			page.show( `/subscribers/${ siteSlug }` );
		}
	);

	// Fetch subscriber details.
	const { data: subscriberDetails, isLoading: isLoadingDetails } = useSubscriberDetailsQuery(
		siteId ?? null,
		// Only pass subscriberId if it's a valid number
		subscriberId && ! isNaN( parseInt( subscriberId, 10 ) )
			? parseInt( subscriberId, 10 )
			: undefined,
		undefined // We only need the subscriberId to fetch details
	);

	const { data: subscribedNewsletterCategoriesData, isLoading: isLoadingNewsletterCategories } =
		useSubscribedNewsletterCategories( {
			siteId: siteId as number,
			subscriptionId:
				subscriberId && ! isNaN( parseInt( subscriberId, 10 ) )
					? parseInt( subscriberId, 10 )
					: undefined,
			userId:
				typeof subscriberDetails?.user_id === 'number' ? subscriberDetails.user_id : undefined,
			enabled: !! subscriberId && !! siteId,
		} );

	// Single effect to handle all subscriber selection scenarios
	useEffect( () => {
		// If no subscriberId in URL, immediately clear selection
		if ( ! subscriberId ) {
			setSelectedSubscriber( null );
			return;
		}

		// If we have details and they match the current URL, use them
		if ( subscriberDetails && subscriberId === getSubscriptionIdString( subscriberDetails ) ) {
			setSelectedSubscriber( subscriberDetails );
		}
		// Don't clear selectedSubscriber - let it keep showing the previous subscriber while loading
		// The SubscriberDetailsSkeleton will show because subscriberDetails won't match subscriberId
	}, [ subscriberId, subscriberDetails ] );

	const { data: subscribersTotals } = useSubscriberCountQuery( siteId ?? null );
	const grandTotal = subscribersTotals?.total_subscribers ?? 0;
	const {
		subscribers,
		is_owner_subscribed: isOwnerSubscribed,
		pages,
		total,
	} = subscribersQueryResult || {
		subscribers: [],
		is_owner_subscribed: false,
		pages: 0,
		total: 0,
	};

	const EmptyComponent = isSimple || isAtomic ? SubscriberLaunchpad : JetpackEmptyListView;
	const shouldShowLaunchpad =
		! isLoading && ! searchTerm && ( ! grandTotal || ( grandTotal === 1 && isOwnerSubscribed ) );

	/**
	 * Read page from URL when component mounts or URL changes.
	 *
	 * URL Parameters:
	 * - /subscribers/{siteSlug}/{subscriberId} - View specific subscriber
	 * - ?page={number} - Navigate to specific page (preserved across views)
	 */
	useEffect( () => {
		const urlParams = new URLSearchParams( window.location.search );
		const pageFromUrl = urlParams.get( 'page' );
		if ( pageFromUrl && ! isNaN( parseInt( pageFromUrl, 10 ) ) ) {
			setCurrentView( ( prev ) => ( {
				...prev,
				page: parseInt( pageFromUrl, 10 ),
			} ) );
		}
	}, [] );

	const handleSubscriberSelection = useCallback(
		( input: Subscriber | string[] ) => {
			if ( Array.isArray( input ) ) {
				if ( input.length === 0 ) {
					setSelectedSubscriber( null );
					page.show( `/subscribers/${ siteSlug }` );
					return;
				}
				const subscriber = subscribersQueryResult?.subscribers.find(
					( s ) => getSubscriptionIdString( s ) === input[ 0 ]
				);
				if ( subscriber ) {
					recordSubscriberClicked( 'list', {
						site_id: siteId,
						subscription_id: getSubscriptionId( subscriber ),
						user_id: subscriber.user_id,
					} );
					page.show(
						`/subscribers/${ siteSlug }/${ getSubscriptionIdString( subscriber ) }?page=${
							currentView.page
						}`
					);
				}
			} else {
				recordSubscriberClicked( 'row', {
					site_id: siteId,
					subscription_id: getSubscriptionId( input ),
					user_id: input.user_id,
				} );
				page.show(
					`/subscribers/${ siteSlug }/${ getSubscriptionIdString( input ) }?page=${
						currentView.page
					}`
				);
			}
		},
		[
			subscribersQueryResult?.subscribers,
			recordSubscriberClicked,
			siteId,
			siteSlug,
			currentView.page,
		]
	);

	// Modify the onClose handler to clear selection before navigation
	const handleClose = useCallback( () => {
		setSelectedSubscriber( null );
		const urlParams = new URLSearchParams( window.location.search );
		const pageParam = urlParams.get( 'page' );
		if ( pageParam ) {
			page.show( `/subscribers/${ siteSlug }?page=${ pageParam }` );
		} else {
			page.show( `/subscribers/${ siteSlug }` );
		}
	}, [ siteSlug ] );

	const fields = useMemo(
		() => [
			{
				id: 'media',
				label: translate( 'Media' ),
				getValue: ( { item }: { item: Subscriber } ) => item.avatar,
				render: ( { item }: { item: Subscriber } ) => (
					<Gravatar
						user={ { avatar_URL: item.avatar, name: item.display_name } }
						size={ 40 }
						imgSize={ 80 }
						className="subscriber-data-views__square-avatar"
					/>
				),
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'name',
				label: translate( 'Name' ),
				getValue: ( { item }: { item: Subscriber } ) => item.display_name,
				render: ( { item }: { item: Subscriber } ) => (
					<SubscriberName displayName={ item.display_name } email={ item.email_address } />
				),
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'plan',
				label: translate( 'Subscription type' ),
				getValue: ( { item }: { item: Subscriber } ) =>
					item.plans?.length ? SubscribersFilterBy.Paid : SubscribersFilterBy.Free,
				render: ( { item }: { item: Subscriber } ) => <SubscriptionTypeCell subscriber={ item } />,
				elements: [
					{ label: translate( 'Paid' ), value: SubscribersFilterBy.Paid },
					{ label: translate( 'Free' ), value: SubscribersFilterBy.Free },
				],
				filterBy: {
					operators: [ 'is' as Operator ],
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'subscription_status',
				label: translate( 'Email subscription' ),
				getValue: ( { item }: { item: Subscriber } ) => item.subscription_status,
				render: ( { item }: { item: Subscriber } ) => (
					<div>
						{ SubscribersStatus[ item.subscription_status as keyof typeof SubscribersStatus ] ??
							item.subscription_status }
					</div>
				),
				elements: [
					{
						label: SubscribersStatus[ 'Subscribed' ],
						value: SubscribersFilterBy.EmailSubscriber,
					},
					{
						label: SubscribersStatus[ 'Not subscribed' ],
						value: SubscribersFilterBy.ReaderSubscriber,
					},
					{
						label: SubscribersStatus[ 'Not confirmed' ],
						value: SubscribersFilterBy.UnconfirmedSubscriber,
					},
					{
						label: SubscribersStatus[ 'Not sending' ],
						value: SubscribersFilterBy.BlockedSubscriber,
					},
				],
				filterBy: {
					operators: [ 'is' as Operator ],
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'date_subscribed',
				label: translate( 'Date subscribed' ),
				getValue: ( { item }: { item: Subscriber } ) =>
					getFormattedSubscriptionDate( item, locale ),
				render: ( { item }: { item: Subscriber } ) => getFormattedSubscriptionDate( item, locale ),
				enableHiding: false,
				enableSorting: true,
			},
		],
		[ locale ]
	);

	const actions = useMemo< Action< Subscriber >[] >( () => {
		// If we're in list view (when a subscriber is selected), return empty actions array.
		if ( selectedSubscriber ) {
			return [];
		}

		const baseActions: Action< Subscriber >[] = [
			{
				id: 'view',
				label: translate( 'View' ),
				callback: ( items: Subscriber[] ) => {
					if ( items[ 0 ] ) {
						handleSubscriberSelection( items[ 0 ] );
					}
				},
				isPrimary: true,
			},
			{
				id: 'remove',
				label: fixMe( {
					text: 'Remove subscriber',
					newCopy: translate( 'Remove subscriber' ),
					oldCopy: translate( 'Remove' ),
				} ) as string,
				callback: handleUnsubscribe,
				isPrimary: false,
				supportsBulk: true,
				icon: trash,
			},
		];

		baseActions.push( {
			id: 'comp',
			label: translate( 'Comp a subscription', {
				textOnly: true,
				comment:
					'"Comp" is short for "complimentary" — granting a free subscription to a subscriber',
			} ),
			isEligible: ( subscriber: Subscriber ) =>
				!! ( subscriber.user_id || subscriber.email_address ) && hasUncompedPlans( subscriber ),
			callback: ( items: Subscriber[] ) => {
				const subscriber = items[ 0 ];
				if ( ! subscriber ) {
					return;
				}

				onCompSubscription( subscriber );
			},
			isPrimary: false,
		} );

		baseActions.push( {
			id: 'remove-comp',
			label: translate( 'Remove comp', {
				textOnly: true,
				comment:
					'"Comp" is short for "complimentary" — revoking a free subscription previously granted to a subscriber',
			} ),
			isEligible: ( subscriber: Subscriber ) => !! findRemovableComp( subscriber ),
			callback: ( items: Subscriber[] ) => {
				const subscriber = items[ 0 ];
				if ( ! subscriber ) {
					return;
				}
				const compPlan = findRemovableComp( subscriber );
				if ( ! compPlan ) {
					return;
				}
				onRemoveComp( {
					planName: compPlan.title ?? '',
					username: subscriber.display_name,
					compId: compPlan.comp_id,
				} );
			},
			isPrimary: false,
		} );

		return baseActions;
	}, [
		selectedSubscriber,
		handleSubscriberSelection,
		handleUnsubscribe,
		onCompSubscription,
		onRemoveComp,
		hasUncompedPlans,
	] );

	const handleViewChange = useCallback(
		( newView: View ) => {
			// Track search changes.
			if ( newView.search !== currentView.search && newView.search ) {
				recordSubscriberSearch( { site_id: siteId, query: newView.search } );
			}

			// Track filter changes.
			const newFilters = newView.filters?.filter( Boolean ) ?? [];
			const currentFilters = currentView.filters?.filter( Boolean ) ?? [];
			if ( JSON.stringify( newFilters ) !== JSON.stringify( currentFilters ) ) {
				newFilters.forEach( ( filter ) => {
					if ( filter?.value ) {
						const field = fields.find( ( f ) => f.id === filter.field );
						const element = field?.elements?.find( ( e ) => e.value === filter.value );
						recordSubscriberFilter( {
							site_id: siteId,
							filter: filter.value as SubscribersFilterBy,
							filter_field: filter.field,
							filter_label: element?.label ?? '',
						} );
					}
				} );
			}

			// Track sort changes.
			if (
				newView.sort?.field !== currentView.sort?.field ||
				newView.sort?.direction !== currentView.sort?.direction
			) {
				recordSubscriberSort( {
					site_id: siteId,
					sort_field: newView.sort?.field as SubscribersSortBy,
					sort_direction: newView.sort?.direction as 'asc' | 'desc',
				} );
			}

			// Update URL when page changes
			if ( newView.page !== currentView.page ) {
				const currentPath = window.location.pathname;
				const urlParams = new URLSearchParams( window.location.search );
				urlParams.set( 'page', String( newView.page ) );
				page.show( `${ currentPath }?${ urlParams.toString() }` );
			}

			setCurrentView( newView );
		},
		[
			currentView,
			recordSubscriberSearch,
			recordSubscriberFilter,
			recordSubscriberSort,
			siteId,
			fields,
		]
	);

	useEffect( () => {
		// If we're on mobile, we only want to show the name field.
		if ( isMobile ) {
			setCurrentView( ( prevView ) => ( {
				...prevView,
				showMedia: false,
				fields: [],
			} ) );
		} else if ( selectedSubscriber ) {
			// If we're on subscribers page, we want to show the list view (name & media).
			setCurrentView( ( prevView ) => ( {
				...prevView,
				type: 'list',
				showTitle: true,
				showMedia: true,
				fields: [],
				layout: undefined,
			} ) );
		} else {
			// Otherwise, we want to show the table view.
			setCurrentView( ( prevView ) => ( {
				...prevView,
				...defaultView,
				layout: defaultView.layout,
			} ) );
		}
	}, [ isMobile, selectedSubscriber ] );

	useEffect( () => {
		// Handle search term from the view.
		setSearchTerm( currentView.search ?? '' );

		// Handle filter option from the view.
		const filterValues =
			( currentView.filters
				// Filter out undefined values to prevent unnecessary queries.
				?.filter( ( filter ) => filter.value !== undefined )
				.map( ( filter ) => filter.value ) as SubscribersFilterBy[] ) ?? [];
		setFilters( filterValues.length ? filterValues : [ SubscribersFilterBy.All ] );
	}, [ currentView.search, currentView.filters ] );

	// Memoize the data and pagination info.
	const { data, paginationInfo } = useMemo( () => {
		return {
			data: subscribers,
			paginationInfo: {
				totalItems: grandTotal,
				totalPages: pages,
			},
		};
	}, [ subscribers, grandTotal, pages ] );

	return (
		<div
			className={ `subscriber-data-views ${ selectedSubscriber ? 'has-selected-subscriber' : '' }` }
		>
			<section className="subscriber-data-views__list">
				<Page
					title={ <JetpackTitle title={ translate( 'Subscribers' ) } /> }
					subTitle={
						! selectedSubscriber &&
						translate(
							'Add subscribers to your site and filter your audience list. {{link}}Learn more{{/link}}.',
							{
								components: {
									link: (
										<a
											href={ localizeUrl( supportUrl ) }
											target="blank"
											onClick={ ( event ) => {
												if ( ! isJetpackCloud() ) {
													event.preventDefault();
													openHelpCenter();
												}
											} }
											rel="noreferrer"
										/>
									),
								},
							}
						)
					}
					actions={
						<>
							<Button
								variant="primary"
								disabled={ isUnverified || isStaging }
								onClick={ () => setShowSubscriberModal( SubscriberModalType.ADD ) }
								size="compact"
								icon={ <Icon icon={ plus } size={ 18 } /> }
								{ ...{
									[ isMobile || !! selectedSubscriber ? 'label' : 'text' ]:
										translate( 'Add subscribers' ),
								} }
							/>
							<SubscribersHeaderPopover
								siteId={ siteId }
								openMigrateSubscribersModal={ () =>
									setShowSubscriberModal( SubscriberModalType.MIGRATE )
								}
							/>
						</>
					}
					showSidebarToggle={ false }
					hasPadding={ false }
				>
					{ siteId && (
						<AddSubscribersModal
							isVisible={ showSubscriberModal === SubscriberModalType.ADD }
							onClose={ closeSubscriberModal }
							addSubscribersCallback={ () => {
								closeSubscriberModal();
								addSubscribersCallback();
							} }
							initialMethod={ initialMethod }
						/>
					) }
					{ siteId && (
						<MigrateSubscribersModal
							isVisible={ showSubscriberModal === SubscriberModalType.MIGRATE }
							onClose={ closeSubscriberModal }
							migrateSubscribersCallback={ ( selectedSourceSiteId ) => {
								closeSubscriberModal();
								migrateSubscribersCallback( selectedSourceSiteId );
							} }
						/>
					) }
					{ shouldShowLaunchpad ? (
						<EmptyComponent />
					) : (
						<>
							<SubscriberTotals
								totalSubscribers={ grandTotal }
								filteredCount={ total }
								filters={ filters }
								searchTerm={ searchTerm }
								isLoading={ isLoading }
							/>
							<DataViews< Subscriber >
								data={ data }
								fields={ fields }
								view={ currentView }
								onClickItem={ handleSubscriberSelection }
								isItemClickable={ () => true }
								onChangeView={ handleViewChange }
								selection={
									selectedSubscriber ? [ getSubscriptionIdString( selectedSubscriber ) ] : undefined
								}
								onChangeSelection={
									currentView.type === 'list' ? handleSubscriberSelection : undefined
								}
								isLoading={ isLoading }
								paginationInfo={ paginationInfo }
								getItemId={ ( item: Subscriber ) => getSubscriptionIdString( item ) }
								defaultLayouts={ selectedSubscriber ? { list: {} } : { table: {} } }
								actions={ actions }
								search
								searchLabel={ translate( 'Search subscribers…' ) }
							/>
						</>
					) }
				</Page>
			</section>
			{ subscriberId && siteId && (
				<section className="subscriber-data-views__details">
					{ isLoadingNewsletterCategories ||
					isLoadingDetails ||
					! subscriberDetails ||
					getSubscriptionIdString( subscriberDetails ) !== subscriberId ? (
						<SubscriberDetailsSkeleton />
					) : (
						<SubscriberDetails
							subscriber={ subscriberDetails }
							siteId={ siteId }
							subscriptionId={ getSubscriptionId( subscriberDetails ) }
							onClose={ handleClose }
							onUnsubscribe={ ( subscriber ) => handleUnsubscribe( [ subscriber ] ) }
							onCompSubscription={
								hasUncompedPlans( subscriberDetails ) ? onCompSubscription : undefined
							}
							onRemoveComp={ ( { planName, compId } ) =>
								onRemoveComp( {
									planName,
									username: subscriberDetails.display_name,
									compId,
								} )
							}
							newsletterCategoriesEnabled={ subscribedNewsletterCategoriesData?.enabled }
							newsletterCategories={ subscribedNewsletterCategoriesData?.newsletterCategories }
						/>
					) }
				</section>
			) }
			<UnsubscribeModal
				subscribers={ currentSubscribers }
				onCancel={ resetSubscribers }
				onConfirm={ onConfirmModal }
			/>
		</div>
	);
}
