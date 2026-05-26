import { purchaseQuery, userPurchasesQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Button,
	CheckboxControl,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState, Fragment } from 'react';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useLocale } from '../../../app/locale';
import {
	cancelPurchaseRoute,
	purchaseSettingsRoute,
	siteActionsRoute,
} from '../../../app/router/me';
import { Card, CardBody, CardDivider, CardHeader } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import { formatDate } from '../../../utils/datetime';
import { getRenewUrlForPurchases, getTitleForListDisplay } from '../../../utils/purchase';
import { useIsSplitCancelRemoveEnabled } from '../cancel-purchase/use-is-split-cancel-remove-enabled';
import { SITE_ACTION_TITLES, type SiteAction } from './constants';
import type { Purchase } from '@automattic/api-core';

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

// `auto-renew` and `cancel` both map to the `cancel` intent on the cancel
// route. The cancel route's `getMutationFlowType( 'cancel', purchase )`
// returns CANCEL_AUTORENEW when the purchase still has auto-renew enabled,
// so the distinction is recovered from purchase state — no separate intent
// value is needed. The stacked wiring branch additionally threads
// `source=auto-renew-toggle` for analytics/copy disambiguation.
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

function getRenewalDescription(
	item: Purchase,
	action: SiteAction | undefined,
	locale: string
): string {
	if ( action === 'remove' ) {
		if ( ! item.expiry_date ) {
			return '';
		}
		return sprintf(
			/* translators: %s: formatted date */
			__( 'Expires on %s.' ),
			formatDate( new Date( item.expiry_date ), locale, { dateStyle: 'long' } )
		);
	}
	const price = formatCurrency( item.price_integer, item.currency_code, {
		isSmallestUnit: true,
	} );
	const renewOrExpiryDate = item.renew_date ?? item.expiry_date;
	if ( ! renewOrExpiryDate ) {
		return '';
	}
	const date = formatDate( new Date( renewOrExpiryDate ), locale, {
		dateStyle: 'long',
	} );
	return sprintf(
		/* translators: %1$s: formatted price, %2$s: formatted date */
		__( 'Renews at %1$s on %2$s.' ),
		price,
		date
	);
}

export default function SiteLevelActions() {
	const locale = useLocale();
	const navigate = useNavigate();
	const isSplitEnabled = useIsSplitCancelRemoveEnabled();
	const { purchaseId } = purchaseSettingsRoute.useParams();
	const { action }: { action?: SiteAction } = siteActionsRoute.useSearch();
	const { data: purchase } = useSuspenseQuery( purchaseQuery( parseInt( purchaseId, 10 ) ) );
	const { data: allPurchases } = useSuspenseQuery( userPurchasesQuery() );

	const eligiblePurchases = getEligiblePurchases( allPurchases, purchase, action ).sort(
		( a, b ) => {
			if ( a.ID === purchase.ID ) {
				return -1;
			}
			if ( b.ID === purchase.ID ) {
				return 1;
			}
			return 0;
		}
	);

	const [ selection, setSelection ] = useState< string[] >( [ String( purchase.ID ) ] );

	useEffect( () => {
		setSelection( [ String( purchase.ID ) ] );
	}, [ purchase.ID ] );

	const shouldBypass =
		! isSplitEnabled || purchase.is_attached_to_holding_site || eligiblePurchases.length <= 1;

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

	if ( shouldBypass ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						prefix={ <Breadcrumbs length={ 4 } /> }
						title={ action ? SITE_ACTION_TITLES[ action ] : __( 'Site actions' ) }
					/>
				}
			>
				<VStack alignment="center" spacing={ 6 }>
					<Spinner />
				</VStack>
			</PageLayout>
		);
	}

	const handleContinue = () => {
		if ( action === 'renew' ) {
			const selectedPurchases = eligiblePurchases.filter( ( p ) =>
				selection.includes( String( p.ID ) )
			);
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
						title={ action ? SITE_ACTION_TITLES[ action ] : __( 'Site actions' ) }
						description={ <Text>{ getDescription( action, siteName, productName ) }</Text> }
					/>
				</VStack>
			}
		>
			<Card className="site-level-actions">
				<CardHeader>
					<SectionHeader title={ getSectionTitle( action ) } level={ 3 } />
				</CardHeader>
				{ eligiblePurchases.map( ( item, index ) => {
					const id = String( item.ID );
					const isPrimary = item.ID === purchase.ID;
					const isChecked = selection.includes( id );
					return (
						<Fragment key={ id }>
							{ index > 0 && <CardDivider /> }
							<CardBody>
								<CheckboxControl
									__nextHasNoMarginBottom
									label={ getTitleForListDisplay( item ) }
									help={ getRenewalDescription( item, action, locale ) }
									checked={ isChecked }
									disabled={ isPrimary }
									onChange={ ( checked ) => {
										setSelection( ( prev ) =>
											checked ? [ ...prev, id ] : prev.filter( ( s ) => s !== id )
										);
									} }
								/>
							</CardBody>
						</Fragment>
					);
				} ) }
				<CardBody>
					<HStack justify="flex-start">{ continueButton }</HStack>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
