import { purchaseQuery, userPurchasesQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Button,
	Spinner,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from 'react';
import Breadcrumbs from '../../../app/breadcrumbs';
import { useLocale } from '../../../app/locale';
import {
	cancelPurchaseRoute,
	purchaseSettingsRoute,
	siteActionsRoute,
} from '../../../app/router/me';
import { Card, CardBody, CardFooter, CardHeader } from '../../../components/card';
import { PageHeader } from '../../../components/page-header';
import PageLayout from '../../../components/page-layout';
import { SectionHeader } from '../../../components/section-header';
import { formatDate } from '../../../utils/datetime';
import { getRenewUrlForPurchases, getTitleForListDisplay } from '../../../utils/purchase';
import { useIsSplitCancelRemoveEnabled } from '../cancel-purchase/use-is-split-cancel-remove-enabled';
import { getEligiblePurchases, SITE_ACTION_TITLES, type SiteAction } from './constants';
import type { Purchase } from '@automattic/api-core';
import type { Field, Form } from '@wordpress/dataviews';

function getDescription( action: SiteAction, siteName: string, productName: string ): string {
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
	}
}

function getSectionTitle( action: SiteAction ): string {
	if ( action === 'remove' ) {
		return __( 'Upgrades' );
	}
	return __( 'Subscriptions' );
}

function getCancelIntent(
	action: Exclude< SiteAction, 'renew' >
): 'cancel' | 'remove' | 'auto-renew' {
	if ( action === 'remove' ) {
		return 'remove';
	}
	if ( action === 'auto-renew' ) {
		return 'auto-renew';
	}
	return 'cancel';
}

function getRenewalDescription( item: Purchase, action: SiteAction, locale: string ): string {
	if ( action === 'remove' ) {
		if ( ! item.expiry_date ) {
			return '';
		}
		if ( item.is_past_expiry_date ) {
			return sprintf(
				/* translators: %s: formatted date */
				__( 'Expired on %s.' ),
				formatDate( new Date( item.expiry_date ), locale, { dateStyle: 'long' } )
			);
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
	const expiryDate = item.expiry_date
		? formatDate( new Date( item.expiry_date ), locale, { dateStyle: 'long' } )
		: null;
	// Once the expiry date has passed, lead with the expiry status rather than
	// any scheduled auto-renewal date. During the grace period the UI should
	// steer toward manual renewal — a remaining auto-renewal attempt is unlikely
	// to succeed — so show "Expired on" even if `renew_date` is still set.
	if ( item.is_past_expiry_date && expiryDate ) {
		return sprintf(
			/* translators: %1$s: formatted price, %2$s: formatted date */
			__( 'Renews at %1$s. Expired on %2$s.' ),
			price,
			expiryDate
		);
	}
	// An upcoming scheduled renewal: show its date. `renew_date` is only
	// populated when there is an upcoming auto-renewal, so an empty value means
	// "not renewing".
	if ( item.renew_date ) {
		return sprintf(
			/* translators: %1$s: formatted price, %2$s: formatted date */
			__( 'Renews at %1$s on %2$s.' ),
			price,
			formatDate( new Date( item.renew_date ), locale, { dateStyle: 'long' } )
		);
	}
	// Not yet expired and not renewing: show the upcoming expiry date.
	if ( expiryDate ) {
		return sprintf(
			/* translators: %1$s: formatted price, %2$s: formatted date */
			__( 'Renews at %1$s. Expires on %2$s.' ),
			price,
			expiryDate
		);
	}
	// One-time/perpetual purchase (no renewal, no expiry): no subtitle.
	return '';
}

export default function SiteLevelActions() {
	const locale = useLocale();
	const navigate = useNavigate();
	const isSplitEnabled = useIsSplitCancelRemoveEnabled();
	const { purchaseId } = purchaseSettingsRoute.useParams();
	const { action } = siteActionsRoute.useParams() as { action: SiteAction };
	const { data: purchase } = useSuspenseQuery( purchaseQuery( parseInt( purchaseId, 10 ) ) );
	const { data: allPurchases } = useSuspenseQuery( userPurchasesQuery() );

	const eligiblePurchases = useMemo(
		() =>
			getEligiblePurchases( allPurchases, purchase, action ).sort( ( a, b ) => {
				if ( a.ID === purchase.ID ) {
					return -1;
				}
				if ( b.ID === purchase.ID ) {
					return 1;
				}
				return 0;
			} ),
		[ allPurchases, purchase, action ]
	);

	type SiteActionsFormData = Record< string, boolean >;

	const initialFormData = useMemo< SiteActionsFormData >( () => {
		const out: SiteActionsFormData = {};
		eligiblePurchases.forEach( ( p ) => {
			out[ String( p.ID ) ] = p.ID === purchase.ID;
		} );
		return out;
	}, [ eligiblePurchases, purchase.ID ] );

	const [ formData, setFormData ] = useState< SiteActionsFormData >( initialFormData );

	useEffect( () => {
		setFormData( initialFormData );
	}, [ initialFormData ] );

	const fields: Field< SiteActionsFormData >[] = useMemo(
		() =>
			eligiblePurchases.map( ( item ) => {
				const id = String( item.ID );
				const isPrimary = item.ID === purchase.ID;
				return {
					id,
					type: 'boolean' as const,
					label: getTitleForListDisplay( item ),
					description: getRenewalDescription( item, action, locale ),
					isDisabled: () => isPrimary,
				};
			} ),
		[ eligiblePurchases, purchase.ID, action, locale ]
	);

	const form: Form = useMemo(
		() => ( {
			layout: { type: 'regular' as const },
			fields: eligiblePurchases.map( ( p ) => String( p.ID ) ),
		} ),
		[ eligiblePurchases ]
	);

	useEffect( () => {
		if ( ! isSplitEnabled ) {
			if ( action === 'renew' ) {
				window.location.href = getRenewUrlForPurchases( [ purchase ] );
				return;
			}
			navigate( {
				to: cancelPurchaseRoute.fullPath,
				params: { purchaseId: String( purchase.ID ) },
				search: { intent: getCancelIntent( action ) },
				replace: true,
			} );
		}
	}, [ isSplitEnabled, action, purchase, navigate ] );

	if ( ! isSplitEnabled ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						prefix={ <Breadcrumbs length={ 4 } /> }
						title={ SITE_ACTION_TITLES[ action ] }
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
		const selectedIds = Object.entries( formData )
			.filter( ( [ , checked ] ) => checked )
			.map( ( [ id ] ) => id );

		if ( action === 'renew' ) {
			const selectedPurchases = eligiblePurchases.filter( ( p ) =>
				selectedIds.includes( String( p.ID ) )
			);
			window.location.href = getRenewUrlForPurchases( selectedPurchases );
			return;
		}

		const additionalIds = selectedIds.filter( ( id ) => id !== String( purchase.ID ) );
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
						{ __( 'Continue' ) }
					</Button>
				);
		}
	} )();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 4 } /> }
					title={ SITE_ACTION_TITLES[ action ] }
					description={ <Text>{ getDescription( action, siteName, productName ) }</Text> }
				/>
			}
		>
			<Card>
				<CardHeader>
					<SectionHeader title={ getSectionTitle( action ) } level={ 3 } />
				</CardHeader>
				<CardBody>
					<DataForm< SiteActionsFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits: SiteActionsFormData ) => {
							setFormData( ( prev ) => ( { ...prev, ...edits } ) );
						} }
					/>
				</CardBody>
				<CardFooter isBorderless>
					<HStack justify="flex-start">{ continueButton }</HStack>
				</CardFooter>
			</Card>
		</PageLayout>
	);
}
