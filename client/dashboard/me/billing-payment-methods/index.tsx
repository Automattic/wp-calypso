import {
	userPaymentMethodsQuery,
	userPaymentMethodSetBackupQuery,
	userPaymentMethodDeleteQuery,
	userPaymentMethodSetTaxInfoQuery,
} from '@automattic/api-queries';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Icon,
	ToggleControl,
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useResizeObserver } from '@wordpress/compose';
import { useDispatch } from '@wordpress/data';
import { DataViews, filterSortAndPaginate } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { info, warning } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import { useState, useMemo } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { addPaymentMethodRoute } from '../../app/router/me';
import { DataViewsCard } from '../../components/dataviews-card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import { adjustDataViewFieldsForWidth } from '../../utils/dataviews-width';
import { formatCreditCardExpiry } from '../../utils/datetime';
import { isCreditCard } from '../../utils/payment-method';
import { PaymentMethodImage } from '../billing-purchases/payment-method-image';
import { PaymentMethodDeleteDialog } from './payment-method-delete-dialog';
import { PaymentMethodDetails } from './payment-method-details';
import { PaymentMethodEditDialog } from './payment-method-edit-dialog';
import type { StoredPaymentMethod } from '@automattic/api-core';
import type { View, Fields, SortDirection, Action } from '@wordpress/dataviews';

const paymentMethodWideFields = [ 'expiry', 'billing-address', 'backup', 'tax-info' ];
const paymentMethodDesktopFields = [ 'expiry', 'billing-address' ];
const paymentMethodMobileFields: string[] = [];
const defaultPerPage = 10;
const defaultSort = {
	field: 'type',
	direction: 'desc' as SortDirection,
};
const paymentMethodsDataView: View = {
	type: 'table',
	page: 1,
	search: '',
	perPage: defaultPerPage,
	titleField: 'title',
	showTitle: true,
	mediaField: 'type',
	showMedia: true,
	descriptionField: 'description',
	showDescription: true,
	fields: paymentMethodWideFields,
	sort: defaultSort,
	layout: {},
};

function getItemId( item: StoredPaymentMethod ): string {
	return item.stored_details_id;
}

export default function PaymentMethods() {
	const navigate = useNavigate();
	const [ removeDialogPaymentMethod, setRemoveDialogPaymentMethod ] = useState<
		StoredPaymentMethod | undefined
	>();
	const [ editAddressDialogPaymentMethod, setEditDialogPaymentMethod ] = useState<
		StoredPaymentMethod | undefined
	>();
	const [ currentView, setView ] = useState( paymentMethodsDataView );
	const ref = useResizeObserver( ( entries ) => {
		const firstEntry = entries[ 0 ];
		if ( firstEntry ) {
			adjustDataViewFieldsForWidth( {
				width: firstEntry.contentRect.width,
				setView,
				wideFields: paymentMethodWideFields,
				desktopFields: paymentMethodDesktopFields,
				mobileFields: paymentMethodMobileFields,
			} );
		}
	} );
	const {
		data: paymentMethods = [],
		isLoading: isLoadingPaymentMethods,
		isRefetching: isUpdatingPaymentMethods,
	} = useQuery(
		userPaymentMethodsQuery( {
			expired: true,
		} )
	);
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { mutate: setPaymentMethodBackup, isPending: isSettingPaymentMethodBackup } = useMutation(
		userPaymentMethodSetBackupQuery()
	);
	const { mutate: deletePaymentMethod, isPending: isDeletingPaymentMethod } = useMutation(
		userPaymentMethodDeleteQuery()
	);
	const { mutate: setPaymentMethodTaxInfo } = useMutation( userPaymentMethodSetTaxInfoQuery() );
	const paymentMethodFields = getFields( {
		isUpdatingPaymentMethods,
		isSettingPaymentMethodBackup,
		setPaymentMethodBackup,
	} );
	const { data: filteredPaymentMethods, paginationInfo } = useMemo( () => {
		return filterSortAndPaginate( paymentMethods, currentView, paymentMethodFields );
	}, [ paymentMethods, currentView, paymentMethodFields ] );
	const actions: Action< StoredPaymentMethod >[] = [
		{
			id: 'enable-backup',
			label: __( 'Use as backup payment method' ),
			isEligible: ( item: StoredPaymentMethod ) => {
				if ( isSettingPaymentMethodBackup ) {
					return false;
				}
				return isCreditCard( item ) && ! item.is_backup;
			},
			callback: ( items ) => {
				const item = items[ 0 ];
				setPaymentMethodBackup( {
					...item,
					is_backup: true,
				} );
			},
		},
		{
			id: 'disable-backup',
			label: __( 'Stop using as backup payment method' ),
			isEligible: ( item: StoredPaymentMethod ) => {
				if ( isSettingPaymentMethodBackup ) {
					return false;
				}
				return item.is_backup;
			},
			callback: ( items ) => {
				const item = items[ 0 ];
				setPaymentMethodBackup( {
					...item,
					is_backup: false,
				} );
			},
		},
		{
			id: 'edit-billing-address',
			label: __( 'Edit billing information' ),
			callback: ( items ) => {
				const item = items[ 0 ];
				setEditDialogPaymentMethod( item );
			},
		},
		{
			id: 'remove',
			label: __( 'Remove payment method' ),
			isEligible: () => {
				return ! isDeletingPaymentMethod;
			},
			callback: ( items ) => {
				const item = items[ 0 ];
				setRemoveDialogPaymentMethod( item );
			},
		},
	];

	return (
		<PageLayout
			size="large"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title={ __( 'Payment methods' ) }
					actions={
						<Button
							__next40pxDefaultSize
							variant="primary"
							onClick={ () => {
								navigate( { to: addPaymentMethodRoute.to } );
							} }
						>
							{ __( 'Add payment method' ) }
						</Button>
					}
				/>
			}
		>
			<div ref={ ref }>
				<DataViewsCard>
					<DataViews
						isLoading={ isLoadingPaymentMethods }
						data={ filteredPaymentMethods ?? [] }
						fields={ paymentMethodFields }
						view={ currentView }
						onChangeView={ setView }
						defaultLayouts={ { table: {} } }
						getItemId={ getItemId }
						paginationInfo={ paginationInfo }
						actions={ actions }
					/>
				</DataViewsCard>
				{ ! isDeletingPaymentMethod && editAddressDialogPaymentMethod && (
					<PaymentMethodEditDialog
						paymentMethod={ editAddressDialogPaymentMethod }
						isVisible={ Boolean( editAddressDialogPaymentMethod ) }
						onCancel={ () => setEditDialogPaymentMethod( undefined ) }
						onConfirm={ ( data ) => {
							setPaymentMethodTaxInfo( data, {
								onSuccess: () => {
									createSuccessNotice( __( 'Billing address updated.' ), { type: 'snackbar' } );
								},
								onError: ( error ) => {
									createErrorNotice( error?.message || __( 'Failed to update billing address.' ), {
										type: 'snackbar',
									} );
								},
							} );
							setEditDialogPaymentMethod( undefined );
						} }
					/>
				) }
				{ ! isDeletingPaymentMethod && removeDialogPaymentMethod && (
					<PaymentMethodDeleteDialog
						isVisible={ Boolean( removeDialogPaymentMethod ) }
						paymentMethod={ removeDialogPaymentMethod }
						onConfirm={ () => {
							deletePaymentMethod( removeDialogPaymentMethod.stored_details_id, {
								onSuccess: () => {
									createSuccessNotice( __( 'Payment method deleted.' ), { type: 'snackbar' } );
								},
								onError: () => {
									createErrorNotice( __( 'Failed to delete payment method.' ), {
										type: 'snackbar',
									} );
								},
							} );
							setRemoveDialogPaymentMethod( undefined );
						} }
						onCancel={ () => setRemoveDialogPaymentMethod( undefined ) }
					/>
				) }
			</div>
		</PageLayout>
	);
}

function getFields( {
	isUpdatingPaymentMethods,
	isSettingPaymentMethodBackup,
	setPaymentMethodBackup,
}: {
	isUpdatingPaymentMethods: boolean;
	isSettingPaymentMethodBackup: boolean;
	setPaymentMethodBackup: (
		paymentMethod: Pick< StoredPaymentMethod, 'stored_details_id' | 'is_backup' >
	) => void;
} ): Fields< StoredPaymentMethod > {
	return [
		{
			id: 'type',
			label: __( 'Payment method type' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: StoredPaymentMethod } ) => {
				return (
					item.stored_details_id + ' ' + item.payment_partner + ' ' + ( item.payment_type ?? '' )
				);
			},
			render: ( { item }: { item: StoredPaymentMethod } ) => {
				return <PaymentMethodIcon paymentMethod={ item } />;
			},
		},
		{
			id: 'title',
			label: __( 'Payment method' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: StoredPaymentMethod } ) => {
				return item.name;
			},
			render: ( { item }: { item: StoredPaymentMethod } ) => {
				return <PaymentMethodTitle paymentMethod={ item } />;
			},
		},
		{
			id: 'description',
			label: __( 'Description' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: StoredPaymentMethod } ) => {
				return `${ item.payment_partner } ${ item.email ?? '' } ${
					isCreditCard( item ) ? `${ item.card_type } ${ item.card_last_4 }` : ''
				}`;
			},
			render: ( { item }: { item: StoredPaymentMethod } ) => {
				return <PaymentMethodDetails paymentMethod={ item } />;
			},
		},
		{
			id: 'expiry',
			label: __( 'Expires' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: StoredPaymentMethod } ) => {
				return item.expiry
					? `${ item.expiry } ${ item.is_expired ? __( 'Credit card expired' ) : '' }`
					: 'does-not-expire';
			},
			render: ( { item }: { item: StoredPaymentMethod } ) => {
				return <PaymentMethodExpiry paymentMethod={ item } />;
			},
		},
		{
			id: 'backup',
			label: __( 'Use as backup' ),
			header: (
				<>
					{ __( 'Use as backup' ) }
					<a
						href={ localizeUrl( 'https://wordpress.com/support/payment/#backup-payment-methods' ) }
						target="_blank"
						rel="noreferrer"
					>
						<Icon icon={ info } size={ 24 } style={ { fill: 'currentColor' } } />
					</a>
				</>
			),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: StoredPaymentMethod } ) => {
				return item.is_backup ? 'is-backup' : 'is-not-backup';
			},
			render: ( { item }: { item: StoredPaymentMethod } ) => {
				return (
					<ToggleControl
						__nextHasNoMarginBottom
						label=""
						checked={ item.is_backup }
						disabled={
							! isCreditCard( item ) || isSettingPaymentMethodBackup || isUpdatingPaymentMethods
						}
						onChange={ () => {
							setPaymentMethodBackup( {
								...item,
								is_backup: ! item.is_backup,
							} );
						} }
					/>
				);
			},
		},
		{
			id: 'billing-address',
			label: __( 'Billing information' ),
			type: 'text',
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: StoredPaymentMethod } ) => {
				return item.tax_location
					? `${ item.tax_location.organization ?? '' } ${ item.tax_location.address ?? '' } ${
							item.tax_location.postal_code ?? ''
					  } ${ item.tax_location.city ?? '' } ${ item.tax_location.subdivision_code ?? '' } ${
							item.tax_location.country_code ?? ''
					  } ${ item.tax_location.is_for_business ? 'business-use' : '' }`
					: 'no-tax-information';
			},
			render: ( { item }: { item: StoredPaymentMethod } ) => {
				return item.tax_location ? (
					<Text>
						{ joinNonEmptyValues(
							', ',
							item.tax_location.postal_code,
							item.tax_location.city,
							item.tax_location.subdivision_code,
							item.tax_location.country_code
						) }
					</Text>
				) : (
					<HStack justify="flex-start">
						<Icon icon={ warning } size={ 16 } style={ { fill: 'currentColor' } } />
						<Text intent="warning">{ __( 'Missing information' ) }</Text>
					</HStack>
				);
			},
		},
	];
}

function PaymentMethodIcon( { paymentMethod }: { paymentMethod: StoredPaymentMethod } ) {
	if ( 'card_type' in paymentMethod && paymentMethod.card_type ) {
		return <PaymentMethodImage paymentMethodType={ paymentMethod.card_type } />;
	}

	return <PaymentMethodImage paymentMethodType={ paymentMethod.payment_partner } />;
}

function PaymentMethodTitle( { paymentMethod }: { paymentMethod: StoredPaymentMethod } ) {
	return <Text>{ paymentMethod.name }</Text>;
}

function PaymentMethodExpiry( { paymentMethod }: { paymentMethod: StoredPaymentMethod } ) {
	if ( 'card_type' in paymentMethod && paymentMethod.card_type ) {
		return (
			<VStack>
				<Text>
					{ sprintf(
						// translators: date is a formatted credit card expiration date, eg: 10/25
						__( 'Expires %(date)s' ),
						{
							// The use of `MM/YY` should not be localized as it is an ISO standard across credit card forms: https://en.wikipedia.org/wiki/ISO/IEC_7813
							date: formatCreditCardExpiry( new Date( paymentMethod.expiry ) ),
						}
					) }
				</Text>
				{ paymentMethod.is_expired && (
					<Text intent="warning">{ __( 'Credit card expired' ) }</Text>
				) }
			</VStack>
		);
	}

	return null;
}

function joinNonEmptyValues( joinString: string, ...values: ( string | undefined )[] ) {
	return values.filter( ( value ) => value && value?.length > 0 ).join( joinString );
}
