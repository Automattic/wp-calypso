import { useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import {
	DataViews,
	filterSortAndPaginate,
	type SortDirection,
	type View,
	type Fields,
} from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useMemo } from 'react';
import { activeSubscriptionsQuery } from '../../app/queries/me-active-subscriptions';
import { sitesQuery } from '../../app/queries/sites';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { ActiveSubscriptionDescription } from './active-subscription-description';
import type { ActiveSubscription } from '../../data/me-active-subscriptions';
import type { Site } from '../../data/site';

const purchasesWideFields = [ 'status', 'payment-method' ];
const purchasesDesktopFields = [ 'status' ];
const purchasesMobileFields: string[] = [];
const defaultPerPage = 10;
const defaultSort = {
	field: 'site',
	direction: 'desc' as SortDirection,
};
export const purchasesDataView: View = {
	type: 'table',
	page: 1,
	perPage: defaultPerPage,
	titleField: 'product',
	showTitle: true,
	mediaField: 'site',
	showMedia: true,
	descriptionField: 'description',
	showDescription: true,
	fields: purchasesDesktopFields,
	sort: defaultSort,
	layout: {},
};

function getDisplayName( item: ActiveSubscription ) {
	if ( item.meta && ( item.is_domain_registration || item.is_domain ) ) {
		return item.meta;
	}
	return item.product_name;
}

const getPurchaseUrl = ( item: ActiveSubscription ) => {
	const siteUrl = item.site_slug || item.domain;
	const subscriptionId = item.ID;
	if ( ! siteUrl ) {
		// eslint-disable-next-line no-console
		console.error( 'Cannot display manage purchase page for subscription without site' );
		return;
	}
	if ( ! subscriptionId ) {
		// eslint-disable-next-line no-console
		console.error( 'Cannot display manage purchase page for subscription without ID' );
		return;
	}
	// FIXME
	return `/me/purchases/${ siteUrl }/${ subscriptionId }`;
};

function getFields( sites: Site[] ): Fields< ActiveSubscription > {
	return [
		{
			id: 'site',
			label: __( 'Site' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			elements: ( () => {
				if ( sites.length < 2 ) {
					// No point in having a filter if there's only one site.
					return undefined;
				}
				return sites.map( ( site ) => {
					return { value: String( site.ID ), label: `${ site.name } (${ site.slug })` };
				} );
			} )(),
			filterBy: { operators: [ 'isAny' ] },
			getValue: ( { item }: { item: ActiveSubscription } ) => {
				// getValue must return a string because the DataViews search feature calls `trim()` on it.
				return String( item.blog_id );
			},
			// Render the site icon
			render: ( { item }: { item: ActiveSubscription } ) => {
				const site = { ID: item.blog_id };
				// FIXME: site icon here
				return (
					<a title={ __( 'Manage purchase' ) } href={ getPurchaseUrl( item ) }>
						{ site.ID }
					</a>
				);
			},
		},
		{
			id: 'product',
			label: __( 'Product' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			getValue: ( { item }: { item: ActiveSubscription } ) => {
				const site = sites.find( ( site ) => site.ID === item.blog_id );
				// Render a bunch of things to make this easily searchable.
				return (
					getDisplayName( item ) +
					' ' +
					item.blogname +
					' ' +
					( item.site_slug || item.domain ) +
					' ' +
					site?.URL
				);
			},
			render: ( { item }: { item: ActiveSubscription } ) => {
				// FIXME: ownerInfo here
				return (
					<div className="purchase-item__information">
						<div className="purchase-item__title">
							<a
								className="purchase-item__title-link"
								title={ __( 'Manage purchase' ) }
								href={ getPurchaseUrl( item ) }
							>
								{ getDisplayName( item ) }
							</a>
						</div>
					</div>
				);
			},
		},
		{
			id: 'description',
			label: __( 'Description' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			getValue: ( { item }: { item: ActiveSubscription } ) => {
				// Render a bunch of things to make this easily searchable.
				const site = sites.find( ( site ) => site.ID === item.blog_id );
				return item.blogname + ' ' + item.domain + ' ' + site?.URL;
			},
			render: ( { item }: { item: ActiveSubscription } ) => {
				const site = sites.find( ( site ) => site.ID === item.blog_id );
				return <ActiveSubscriptionDescription purchase={ item } site={ site } />;
			},
		},
		{
			id: 'type',
			label: __( 'Type' ),
			enableHiding: false,
			enableSorting: true,
			type: 'text',
			elements: [
				{ value: 'domain', label: __( 'Domains' ) },
				{ value: 'plan', label: __( 'Plans' ) },
				{ value: 'other', label: __( 'Other' ) },
			],
			filterBy: { operators: [ 'is' ] },
			getValue: ( { item } ) => {
				if ( item.is_domain || item.is_domain_registration ) {
					return 'domain';
				}
				if ( item.product_type === 'bundle' ) {
					return 'plan';
				}
				return 'other';
			},
		},
		{
			id: 'expiring-soon',
			enableHiding: false,
			enableSorting: true,
			label: __( 'Expiring soon' ),
			type: 'text',
			elements: [
				{
					value: '7',
					// translators: %s: number of days
					label: sprintf( __( 'Expires in %(days)d days' ), { days: 7 } ),
				},
				{
					value: '14',
					// translators: %s: number of days
					label: sprintf( __( 'Expires in %(days)d days' ), { days: 14 } ),
				},
				{
					value: '30',
					// translators: %s: number of days
					label: sprintf( __( 'Expires in %(days)d days' ), { days: 30 } ),
				},
				{
					value: '60',
					// translators: %s: number of days
					label: sprintf( __( 'Expires in %(days)d days' ), { days: 60 } ),
				},
				{
					value: '365',
					// translators: %s: number of days
					label: sprintf( __( 'Expires in %(days)d days' ), { days: 365 } ),
				},
			],
			filterBy: { operators: [ 'is' ] },
			getValue: ( { item } ) => {
				const now = Date.now();
				const expiryDate = Date.parse( item.expiry_date );
				if ( ! item.is_renewable || ! expiryDate || expiryDate < now ) {
					return 'not-expiring-soon';
				}
				const msPerDay = 86_400_000;
				const msTilExpiry = expiryDate - now;
				if ( msTilExpiry <= 7 * msPerDay ) {
					return '7';
				}
				if ( msTilExpiry <= 14 * msPerDay ) {
					return '14';
				}
				if ( msTilExpiry <= 30 * msPerDay ) {
					return '30';
				}
				if ( msTilExpiry <= 60 * msPerDay ) {
					return '60';
				}
				if ( msTilExpiry <= 365 * msPerDay ) {
					return '365';
				}
				return 'not-expiring-soon';
			},
		},
		{
			id: 'status',
			label: __( 'Expires/Renews on' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			getValue: ( { item }: { item: ActiveSubscription } ) => {
				if ( item.expiry_status === 'expired' ) {
					// Prefix expired items with a z so they sort to the end of the list.
					return 'zzz ' + item.expiry_status + ' ' + item.expiry_date;
				}
				// Include date in value to sort similar expiries together.
				return item.expiry_date + ' ' + item.expiry_status;
			},
			render: ( { item }: { item: ActiveSubscription } ) => {
				// FIXME: status here (like "Expires")
				return String( item.expiry_status );
			},
		},
		{
			id: 'payment-method',
			label: __( 'Payment method' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			getValue: ( { item }: { item: ActiveSubscription } ) => {
				// Allows sorting by card number or payment partner (eg: `type === 'paypal'`).
				return item.expiry_status === 'expired'
					? // Do not return card number for expired purchases because it
					  // will not be displayed so it will look wierd if we sort
					  // expired purchases with active ones that have the same card.
					  'expired'
					: item.payment_details ?? item.payment_card_type ?? 'no-payment-method';
			},
			render: ( { item }: { item: ActiveSubscription } ) => {
				// FIXME: show backup info
				// FIXME: payment method here
				return <div className="purchase-item__payment-method">{ item.payment_name }</div>;
			},
		},
	];
}

const getItemId = ( item: ActiveSubscription ) => {
	return item.ID.toString();
};

function adjustViewFieldsForWidth(
	width: number,
	setView: ( setter: View | ( ( view: View ) => View ) ) => void
): void {
	if ( width >= 1280 ) {
		setView( ( view ) => {
			if ( view.fields?.length !== purchasesWideFields.length ) {
				return {
					...view,
					fields: purchasesWideFields,
				};
			}
			return view;
		} );
		return;
	}
	if ( width >= 960 ) {
		setView( ( view ) => {
			if ( view.fields?.length !== purchasesDesktopFields.length ) {
				return {
					...view,
					fields: purchasesDesktopFields,
				};
			}
			return view;
		} );
		return;
	}
	if ( width < 960 ) {
		setView( ( view ) => {
			if ( view.fields?.length !== purchasesMobileFields.length ) {
				return {
					...view,
					fields: purchasesMobileFields,
				};
			}
			return view;
		} );
		return;
	}
}

export default function ActiveSubscriptions() {
	const { data: activeSubscriptions, isLoading } = useQuery( activeSubscriptionsQuery() );
	const { data: sites } = useQuery( sitesQuery() );
	const [ currentView, setView ] = useState( purchasesDataView );
	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustViewFieldsForWidth( firstEntry.contentRect.width, setView );
		}
	} );
	const purchasesDataFields = getFields( sites ?? [] );
	const { data: filteredSubscriptions, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( activeSubscriptions ?? [], currentView, purchasesDataFields );
	}, [ activeSubscriptions, currentView, purchasesDataFields ] );

	return (
		<PageLayout size="large" header={ <PageHeader title={ __( 'Active Subscriptions' ) } /> }>
			<div ref={ ref }>
				<DataViews
					isLoading={ isLoading }
					data={ filteredSubscriptions ?? [] }
					fields={ purchasesDataFields }
					view={ currentView }
					onChangeView={ setView }
					defaultLayouts={ { table: {} } }
					getItemId={ getItemId }
					paginationInfo={ paginationInfo }
				/>
			</div>
		</PageLayout>
	);
}
