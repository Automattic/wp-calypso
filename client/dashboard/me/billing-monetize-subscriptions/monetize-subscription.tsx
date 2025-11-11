import { MonetizeSubscription } from '@automattic/api-core';
import {
	monetizeSubscriptionDisableAutoRenew,
	monetizeSubscriptionQuery,
	monetizeSubscriptionResumeAutoRenew,
	monetizeSubscriptionStop,
} from '@automattic/api-queries';
import { useLocale } from '@automattic/i18n-utils';
import { formatCurrency } from '@automattic/number-formatters';
import { CALYPSO_CONTACT } from '@automattic/urls';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalGrid as Grid,
	__experimentalVStack as VStack,
	Button,
	Notice,
	ToggleControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { calendar, currencyDollar, rotateRight, siteLogo } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import Breadcrumbs from '../../app/breadcrumbs';
import { monetizeSubscriptionRoute, monetizeSubscriptionsRoute } from '../../app/router/me';
import ActionList from '../../components/action-list';
import { Card, CardBody } from '../../components/card';
import { useFormattedTime } from '../../components/formatted-time';
import OverviewCard from '../../components/overview-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { formatDate } from '../../utils/datetime';

import './style.scss';

function AutoRenewButton( {
	disableAutoRenew,
	enableAutoRenew,
	isAutoRenewing,
	isUpdating,
	isProduct,
	subscription,
}: {
	disableAutoRenew: ( data: any, variables?: object ) => void;
	enableAutoRenew: ( data: any, variables?: object ) => void;
	isUpdating: boolean;
	isAutoRenewing: boolean;
	isProduct: boolean;
	subscription: MonetizeSubscription;
} ) {
	const { createErrorNotice } = useDispatch( noticesStore );
	const title = isAutoRenewing ? __( 'Disable auto-renew' ) : __( 'Enable auto-renew' );
	const onError = () => {
		if ( isProduct ) {
			createErrorNotice( __( 'Failed to remove your product.' ), {
				actions: [
					{
						url: CALYPSO_CONTACT,
						label: __( 'Please contact support' ),
					},
				],
				type: 'snackbar',
			} );
		} else {
			createErrorNotice( __( 'Failed to update your subscription.' ), {
				actions: [
					{
						url: CALYPSO_CONTACT,
						label: __( 'Please contact support' ),
					},
				],
				type: 'snackbar',
			} );
		}
	};
	const fields = [
		{
			id: 'is_auto_renew_enabled',
			label: __( 'Enable auto-renew' ),
			Edit: ( { data }: { data: MonetizeSubscription } ) => {
				const locale = useLocale();
				const helpText = ( () => {
					if ( isAutoRenewing ) {
						// translators: date is a formatted date string
						return sprintf( __( 'You will be billed on %(date)s' ), {
							date: formatDate( new Date( Date.parse( data?.end_date ?? '' ) ), locale, {
								dateStyle: 'long',
							} ),
						} );
					}
				} )();
				return (
					<ToggleControl
						__nextHasNoMarginBottom
						className="purchase-settings__toggle-control"
						label={ title }
						checked={ isAutoRenewing }
						disabled={ isUpdating }
						onChange={ () =>
							isAutoRenewing
								? disableAutoRenew( null, { onError: onError } )
								: enableAutoRenew( null, { onError: onError } )
						}
						help={ helpText }
					/>
				);
			},
		},
	];

	const form = {
		type: 'regular' as const,
		labelPosition: 'top' as const,
		fields: [
			{
				id: 'autoRenew',
				label: __( 'Manage subscription' ),
				children: [ 'is_auto_renew_enabled' ],
			},
		],
	};

	return (
		<Card>
			<CardBody>
				<DataForm
					fields={ fields }
					data={ subscription }
					form={ form }
					onChange={ () => {
						isAutoRenewing
							? disableAutoRenew( null, { onError: onError } )
							: enableAutoRenew( null, { onError: onError } );
					} }
				/>
			</CardBody>
		</Card>
	);
}

function StopSubscriptionButton( {
	stopSubscription,
	isProduct,
	subscription,
}: {
	stopSubscription: ( data: any, variables: object ) => void;
	isProduct: boolean;
	subscription: MonetizeSubscription;
} ) {
	const { createErrorNotice, createSuccessNotice } = useDispatch( noticesStore );
	const navigate = useNavigate();
	const title = isProduct
		? // translators: %s is the product title
		  sprintf( __( 'Remove %s product' ), subscription.title )
		: // translators: %s is the product title
		  sprintf( __( 'Stop %s subscription' ), subscription.title );
	return (
		<ActionList.ActionItem
			title={ title }
			description={ __( 'We’ll be sorry to see you go!' ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					onClick={ () => {
						stopSubscription( null, {
							onSuccess: () => {
								createSuccessNotice( __( 'This item has been removed.' ), { type: 'snackbar' } );
								navigate( { to: monetizeSubscriptionsRoute.fullPath } );
							},
							onError: () => {
								if ( isProduct ) {
									createErrorNotice( __( 'There was a problem while removing your product.' ), {
										actions: [
											{
												url: CALYPSO_CONTACT,
												label: __( 'Please contact support' ),
											},
										],
										type: 'snackbar',
									} );
								} else {
									createErrorNotice(
										__( 'There was a problem while stopping your subscription.' ),
										{
											actions: [
												{
													url: CALYPSO_CONTACT,
													label: __( 'Please contact support' ),
												},
											],
											type: 'snackbar',
										}
									);
								}
							},
						} );
					} }
				>
					{ title }
				</Button>
			}
		/>
	);
}

export default function MonetizeSubscriptionDetails() {
	const params = monetizeSubscriptionRoute.useParams();
	const subscriptionId: string = params.subscriptionId ?? '';
	const { data: subscription } = useQuery( monetizeSubscriptionQuery( subscriptionId ) );

	const { mutate: stopSubscription, isPending: isStoppingSubscription } = useMutation(
		monetizeSubscriptionStop( subscriptionId )
	);

	const { mutate: disableAutoRenew, isPending: isDisablingAutoRenew } = useMutation(
		monetizeSubscriptionDisableAutoRenew( subscriptionId )
	);

	const { mutate: enableAutoRenew, isPending: isEnablingAutoRenew } = useMutation(
		monetizeSubscriptionResumeAutoRenew( subscriptionId )
	);

	const isRenewable = subscription?.is_renewable ?? false;
	const isAutoRenewing = isRenewable && !! subscription?.renew_interval;
	const isProduct = ! isRenewable;
	const isUpdating = isEnablingAutoRenew || isDisablingAutoRenew;
	const formattedExpiry = useFormattedTime( subscription?.end_date ?? '' );
	const formattedRenewal = useFormattedTime( subscription?.end_date ?? '' );
	const isOneTimePurchase = subscription?.renew_interval === 'one-time';
	const expiryDateTitle = ( () => {
		if ( isProduct ) {
			return __( 'Paid until' );
		}
		if ( isAutoRenewing ) {
			return __( 'Renews' );
		}
		return __( 'Expires' );
	} )();

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ isProduct ? __( 'Product details' ) : __( 'Subscription details' ) }
				/>
			}
		>
			{ isStoppingSubscription && (
				<Notice status="info">
					{ isProduct ? __( 'Removing this product.' ) : __( 'Stopping this subscription.' ) }
				</Notice>
			) }
			{ isUpdating && <Notice status="info">{ __( 'Updating subscription auto-renew' ) }</Notice> }
			{ subscription && (
				<VStack spacing={ 6 }>
					<Grid columns={ 2 } rows={ 2 } gap={ 6 }>
						<OverviewCard
							icon={ siteLogo }
							title={ __( 'Site' ) }
							heading={ subscription.site_title }
							description={ subscription.site_url }
							link={ subscription.site_url }
						/>
						<OverviewCard
							icon={ calendar }
							title={ expiryDateTitle }
							heading={ ( () => {
								if ( isOneTimePurchase ) {
									return __( 'Never expires.' );
								}
								if ( isAutoRenewing ) {
									return formattedRenewal;
								}
								return formattedExpiry;
							} )() }
							description={ ( () => {
								if ( isAutoRenewing ) {
									return __( 'Auto-renew is enabled.' );
								}
								return __( 'Auto-renew is disabled.' );
							} )() }
						/>

						{ isOneTimePurchase && (
							<OverviewCard
								icon={ currencyDollar }
								title={ __( 'Price' ) }
								heading={ formatCurrency(
									parseFloat( subscription.renewal_price ),
									subscription.currency,
									{
										isSmallestUnit: true,
									}
								) }
								description={ __( 'Excludes taxes.' ) }
							/>
						) }

						{ ! isOneTimePurchase && (
							<OverviewCard
								icon={ currencyDollar }
								title={ __( 'Renewal price' ) }
								heading={ formatCurrency(
									parseFloat( subscription.renewal_price ),
									subscription.currency,
									{
										isSmallestUnit: true,
									}
								) }
							/>
						) }
						<OverviewCard
							icon={ rotateRight }
							title={ __( 'Renewal interval' ) }
							heading={ subscription.renew_interval || '-' }
						/>
					</Grid>

					{ isRenewable && (
						<AutoRenewButton
							subscription={ subscription }
							isAutoRenewing={ isAutoRenewing }
							isUpdating={ isUpdating }
							disableAutoRenew={ disableAutoRenew }
							enableAutoRenew={ enableAutoRenew }
							isProduct={ isProduct }
						/>
					) }
					<ActionList>
						<StopSubscriptionButton
							subscription={ subscription }
							stopSubscription={ stopSubscription }
							isProduct={ isProduct }
						/>
					</ActionList>
				</VStack>
			) }
		</PageLayout>
	);
}
