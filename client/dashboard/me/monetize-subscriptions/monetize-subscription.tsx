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
import { useNavigate, useRouter } from '@tanstack/react-router';
import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalSpacer as Spacer,
	Card,
	CardHeader,
	Button,
	Notice,
	CardBody,
	ToggleControl,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm } from '@wordpress/dataviews';
import { __, isRTL, sprintf } from '@wordpress/i18n';
import { Icon, globe, chevronRight, chevronLeft } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { monetizeSubscriptionRoute } from '../../app/router/me';
import ActionList from '../../components/action-list';
import { addFlashMessage } from '../../components/flash-message';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import {
	getMonetizeSubscriptionsUrl,
	getMonetizeSubscriptionsPageTitle,
} from '../../me/monetize-subscriptions/urls';
import { formatDate } from '../../utils/datetime';
import type { MonetizeSubscription } from '@automattic/api-core';

function MonetizeSiteHeader( { name, domain }: { name: string; domain: string } ) {
	return (
		<CardHeader>
			<HStack spacing={ 5 } alignment="left">
				<VStack alignment="center">
					<Icon icon={ globe } />
				</VStack>
				<VStack>
					<Text weight={ 700 }>{ name }</Text>
					<Text>{ domain }</Text>
				</VStack>
				<Spacer />
			</HStack>
		</CardHeader>
	);
}

function AutoRenewButton( {
	disableAutoRenew,
	enableAutoRenew,
	isAutoRenewing,
	isUpdating,
	isProduct,
	subscription,
}: {
	disableAutoRenew: ( data: any, variables: object ) => void;
	enableAutoRenew: ( data: any, variables: object ) => void;
	isUpdating: boolean;
	isAutoRenewing: boolean;
	isProduct: boolean;
	subscription: MonetizeSubscription;
} ) {
	const { createErrorNotice } = useDispatch( noticesStore );
	const title = isAutoRenewing ? __( 'Disable auto-renew' ) : __( 'Enable auto-renew' );
	const onError = () => {
		if ( isProduct ) {
			createErrorNotice( __( 'There was a problem while removing your product.' ), {
				actions: [
					{
						url: CALYPSO_CONTACT,
						label: __( 'Please contact support' ),
					},
				],
			} );
		} else {
			createErrorNotice( __( 'There was a problem while updating your subscription.' ), {
				url: CALYPSO_CONTACT,
				label: __( 'Please contact support' ),
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
							date: formatDate( new Date( Date.parse( data.end_date ) ), locale, {
								dateStyle: 'long',
							} ),
						} );
					}
				} )();
				return (
					<ToggleControl
						__nextHasNoMarginBottom
						label={ title }
						checked={ isAutoRenewing }
						disabled={ isUpdating }
						onChange={ () => ( isAutoRenewing ? disableAutoRenew() : enableAutoRenew() ) }
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
				<VStack spacing={ 4 } alignment="left">
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
				</VStack>
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
	const { createErrorNotice } = useDispatch( noticesStore );
	const navigate = useNavigate();
	const title = isProduct
		? // eslint-disable-next-line @wordpress/i18n-translator-comments
		  sprintf( __( 'Remove %s product' ), subscription.title )
		: // eslint-disable-next-line @wordpress/i18n-translator-comments
		  sprintf( __( 'Stop %s subscription' ), subscription.title );
	return (
		<ActionList.ActionItem
			title={ title }
			description={ __( "We'll be sorry to see you go!" ) }
			actions={
				<Button
					variant="secondary"
					size="compact"
					onClick={ () => {
						stopSubscription( null, {
							onSuccess: () => {
								navigate( {
									to: addFlashMessage( getMonetizeSubscriptionsUrl() ),
								} );
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

const BackButton = () => {
	const router = useRouter();

	return (
		<Button
			className="dashboard-page-header__back-button"
			icon={ isRTL() ? chevronRight : chevronLeft }
			onClick={ () => {
				router.navigate( {
					to: getMonetizeSubscriptionsUrl(),
				} );
			} }
		>
			{ getMonetizeSubscriptionsPageTitle() }
		</Button>
	);
};

export default function MonetizeSubscription() {
	const params = monetizeSubscriptionRoute.useParams();
	const subscriptionId: string = params.subscriptionId;
	const locale = useLocale();

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

	const isRenewable = subscription && ( subscription.renew_interval || subscription.is_renewable ); // can remove renew_interval once backend is deployed
	const isAutoRenewing = isRenewable && subscription.renew_interval;
	const isProduct = !! subscription && ! isRenewable;
	const isDisabledAutorenewing = isRenewable && ! subscription.renew_interval;
	const isUpdating = isEnablingAutoRenew || isDisablingAutoRenew;
	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <BackButton /> }
					title={ isProduct ? __( 'Product Details' ) : __( 'Subscription Details' ) }
				/>
			}
		>
			{ isStoppingSubscription && (
				<Notice status="info">
					{ isProduct ? __( 'Removing this product' ) : __( 'Stopping this subscription' ) }
				</Notice>
			) }
			{ isUpdating && <Notice status="info">{ __( 'Updating subscription auto-renew' ) }</Notice> }
			{ subscription && (
				<VStack spacing={ 4 }>
					<Card>
						<MonetizeSiteHeader name={ subscription.site_title } domain={ subscription.site_url } />

						<CardHeader>
							<HStack alignment="center">
								<VStack>
									<HStack alignment="center">
										<Text weight={ 700 } size="title" as="h3">
											{ subscription.title }
										</Text>
										<Text weight={ 700 }>
											{ formatCurrency(
												parseFloat( subscription.renewal_price ),
												subscription.currency
											) }
										</Text>
									</HStack>

									{ ! isProduct && (
										<center>
											{ subscription.renew_interval
												? __( 'Auto-renew is ON' )
												: __( 'Auto-renew is OFF' ) }
										</center>
									) }
								</VStack>
							</HStack>
						</CardHeader>

						<CardBody>
							<HStack>
								<Card>
									<CardHeader>{ __( 'Renew interval' ) }</CardHeader>
									<CardBody>
										<HStack alignment="center">{ subscription.renew_interval || '-' }</HStack>
									</CardBody>
								</Card>
								<Card>
									<CardHeader>{ __( 'Subscribed On' ) }</CardHeader>
									<CardBody>
										{ formatDate( new Date( Date.parse( subscription.start_date ) ), locale ) }
									</CardBody>
								</Card>
								<Card>
									<CardHeader>
										{ isDisabledAutorenewing ? __( 'Expires on' ) : __( 'Renews on' ) }
									</CardHeader>

									<CardBody>
										{ subscription.end_date
											? formatDate( new Date( Date.parse( subscription.end_date ) ), locale )
											: __( 'Never Expires' ) }
									</CardBody>
								</Card>
							</HStack>
						</CardBody>
					</Card>
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
