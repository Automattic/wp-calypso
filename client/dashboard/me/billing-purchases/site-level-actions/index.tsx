import { purchaseQuery, userPurchasesQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Button,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useLocale } from '../../../app/locale';
import {
	cancelPurchaseRoute,
	purchaseSettingsRoute,
	siteActionsRoute,
} from '../../../app/router/me';
import { Card, CardBody } from '../../../components/card';
import { DataViews } from '../../../components/dataviews';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { formatDate } from '../../../utils/datetime';
import { getRenewUrlForPurchases, getTitleForListDisplay } from '../../../utils/purchase';
import { useIsSplitCancelRemoveEnabled } from '../cancel-purchase/use-is-split-cancel-remove-enabled';
import type { Purchase } from '@automattic/api-core';
import type { Field, Action } from '@wordpress/dataviews';

import './style.scss';

type SiteAction = 'renew' | 'cancel' | 'remove' | 'auto-renew';

function getTitle( action?: SiteAction ): string {
	switch ( action ) {
		case 'renew':
			return __( 'Renew subscriptions' );
		case 'cancel':
			return __( 'Cancel subscriptions' );
		case 'remove':
			return __( 'Remove upgrades' );
		case 'auto-renew':
			return __( 'Turn off auto-renew' );
		default:
			return __( 'Site actions' );
	}
}

function getDescription(
	action: SiteAction | undefined,
	siteName: string,
	productName: string
): string {
	switch ( action ) {
		case 'renew':
			return sprintf(
				/* translators: %1$s: site name, %2$s: product name */
				__(
					'Your site %1$s has other subscriptions. Select any you\u2019d like to renew along with %2$s.'
				),
				siteName,
				productName
			);
		case 'cancel':
			return sprintf(
				/* translators: %1$s: site name, %2$s: product name */
				__(
					'Your site %1$s has other subscriptions. Select any you\u2019d like to cancel along with %2$s.'
				),
				siteName,
				productName
			);
		case 'remove':
			return sprintf(
				/* translators: %1$s: site name, %2$s: product name */
				__(
					'Your site %1$s has other upgrades. Select any you\u2019d like to remove along with %2$s.'
				),
				siteName,
				productName
			);
		case 'auto-renew':
			return sprintf(
				/* translators: %1$s: site name, %2$s: product name */
				__(
					'Your site %1$s has other subscriptions. Select any you\u2019d like to turn off auto-renew for along with %2$s.'
				),
				siteName,
				productName
			);
		default:
			return '';
	}
}

function getSectionTitle( action?: SiteAction ): string {
	if ( action === 'remove' ) {
		return __( 'Upgrades' );
	}
	return __( 'Subscriptions' );
}

function getCancelIntent( action?: SiteAction ): 'cancel' | 'remove' {
	if ( action === 'remove' ) {
		return 'remove';
	}
	return 'cancel';
}

function getEligiblePurchases(
	purchases: Purchase[],
	primaryPurchase: Purchase,
	action?: SiteAction
): Purchase[] {
	const sitePurchases = purchases.filter( ( p ) => p.blog_id === primaryPurchase.blog_id );

	if ( action === 'cancel' || action === 'auto-renew' ) {
		return sitePurchases.filter( ( p ) => p.is_auto_renew_enabled || p.ID === primaryPurchase.ID );
	}

	// Remove and renew: show all site purchases
	return sitePurchases;
}

export default function SiteLevelActions() {
	const locale = useLocale();
	const navigate = useNavigate();
	const isSplitEnabled = useIsSplitCancelRemoveEnabled();
	const { purchaseId } = purchaseSettingsRoute.useParams();
	const { action } = siteActionsRoute.useSearch();
	const { data: purchase } = useSuspenseQuery( purchaseQuery( parseInt( purchaseId ) ) );
	const { data: allPurchases, isLoading } = useQuery( userPurchasesQuery() );

	const eligiblePurchases = allPurchases
		? getEligiblePurchases( allPurchases, purchase, action )
		: [];

	const [ selection, setSelection ] = useState< string[] >( [ String( purchase.ID ) ] );

	const shouldBypass = ! isSplitEnabled || ( ! isLoading && eligiblePurchases.length <= 1 );

	useEffect( () => {
		if ( ! shouldBypass ) {
			return;
		}

		if ( action === 'renew' ) {
			window.location.href = getRenewUrlForPurchases( [ purchase ] );
			return;
		}

		navigate( {
			to: cancelPurchaseRoute.fullPath,
			params: { purchaseId: purchase.ID },
			search: { intent: getCancelIntent( action ) },
			replace: true,
		} );
	}, [ shouldBypass, action, purchase, navigate, purchaseId ] );

	if ( shouldBypass || isLoading ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader prefix={ <Breadcrumbs length={ 4 } /> } title={ getTitle( action ) } />
				}
			>
				<VStack alignment="center" spacing={ 6 }>
					<Spinner />
				</VStack>
			</PageLayout>
		);
	}

	const handleSelectionChange = ( newSelection: string[] ) => {
		const primaryId = String( purchase.ID );
		if ( ! newSelection.includes( primaryId ) ) {
			newSelection = [ ...newSelection, primaryId ];
		}
		setSelection( newSelection );
	};

	const handleContinue = () => {
		const selectedPurchases = eligiblePurchases.filter( ( p ) =>
			selection.includes( String( p.ID ) )
		);

		if ( action === 'renew' ) {
			window.location.href = getRenewUrlForPurchases( selectedPurchases );
			return;
		}

		const additionalIds = selection.filter( ( id ) => id !== String( purchase.ID ) );
		navigate( {
			to: cancelPurchaseRoute.fullPath,
			params: { purchaseId: purchase.ID },
			search: {
				intent: getCancelIntent( action ),
				...( additionalIds.length > 0 ? { additionalPurchaseIds: additionalIds.join( ',' ) } : {} ),
			},
		} );
	};

	const siteName = purchase.site_slug ?? purchase.domain;
	const productName = purchase.product_name;

	const fields: Field< Purchase >[] = [
		{
			id: 'product',
			label: __( 'Product' ),
			type: 'text',
			getValue: ( { item } ) => getTitleForListDisplay( item ),
			render: ( { item } ) => <>{ getTitleForListDisplay( item ) }</>,
			enableGlobalSearch: false,
			enableHiding: false,
		},
		{
			id: 'renewal-info',
			label: __( 'Renewal' ),
			type: 'text',
			render: ( { item } ) => {
				if ( action === 'remove' ) {
					if ( ! item.expiry_date ) {
						return null;
					}
					return (
						<span>
							{ sprintf(
								/* translators: %s: formatted date */
								__( 'Expires on %s' ),
								formatDate( new Date( item.expiry_date ), locale, { dateStyle: 'long' } )
							) }
						</span>
					);
				}
				const price = formatCurrency( item.price_integer, item.currency_code, {
					isSmallestUnit: true,
				} );
				const renewOrExpiryDate = item.renew_date ?? item.expiry_date;
				if ( ! renewOrExpiryDate ) {
					return null;
				}
				const date = formatDate( new Date( renewOrExpiryDate ), locale, {
					dateStyle: 'long',
				} );
				return (
					<span>
						{ sprintf(
							/* translators: %1$s: formatted price, %2$s: formatted date */
							__( 'Renews at %1$s on %2$s' ),
							price,
							date
						) }
					</span>
				);
			},
			enableGlobalSearch: false,
			enableHiding: false,
		},
	];

	// A bulk action is needed to enable selection checkboxes in DataViews
	const actions: Action< Purchase >[] = [
		{
			id: 'continue',
			label: __( 'Continue' ),
			supportsBulk: true,
			callback: () => {
				// No-op — the real continue logic is on the button below
			},
		},
	];

	const continueButton = ( () => {
		switch ( action ) {
			case 'renew':
				return (
					<Button variant="primary" onClick={ handleContinue }>
						{ __( 'Continue to checkout' ) }
					</Button>
				);
			case 'cancel':
				return (
					<Button variant="primary" isDestructive onClick={ handleContinue }>
						{ __( 'Continue to cancel' ) }
					</Button>
				);
			case 'remove':
				return (
					<Button variant="primary" isDestructive onClick={ handleContinue }>
						{ __( 'Continue to remove' ) }
					</Button>
				);
			case 'auto-renew':
				return (
					<Button variant="primary" isDestructive onClick={ handleContinue }>
						{ __( 'Turn off auto-renew' ) }
					</Button>
				);
			default:
				return null;
		}
	} )();

	return (
		<PageLayout
			size="small"
			header={
				<VStack>
					<PageHeader
						prefix={ <Breadcrumbs length={ 4 } /> }
						title={ getTitle( action ) }
						description={
							<Text className="site-level-actions__description">
								{ getDescription( action, siteName, productName ) }
							</Text>
						}
					/>
				</VStack>
			}
		>
			<Card className="site-level-actions">
				<CardBody>
					<h3 className="site-level-actions__section-title">{ getSectionTitle( action ) }</h3>
					<DataViews< Purchase >
						data={ eligiblePurchases }
						fields={ fields }
						view={ {
							type: 'table',
							perPage: 100,
							titleField: 'product',
							fields: [ 'renewal-info' ],
						} }
						onChangeView={ () => {} }
						defaultLayouts={ { table: {} } }
						actions={ actions }
						getItemId={ ( item: Purchase ) => String( item.ID ) }
						paginationInfo={ {
							totalItems: eligiblePurchases.length,
							totalPages: 1,
						} }
						selection={ selection }
						onChangeSelection={ handleSelectionChange }
						search={ false }
					/>
					<div className="site-level-actions__button-row">
						<HStack justify="flex-start">{ continueButton }</HStack>
					</div>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
