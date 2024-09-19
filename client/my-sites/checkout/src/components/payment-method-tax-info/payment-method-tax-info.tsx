import { Gridicon, Button, Dialog } from '@automattic/components';
import { FormStatus, useFormStatus } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import Notice from 'calypso/components/notice';
import { PaymentMethodSummary } from 'calypso/lib/checkout/payment-methods';
import TaxFields from 'calypso/my-sites/checkout/src/components/tax-fields';
import useCountryList from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import { usePaymentMethodTaxInfo } from './use-payment-method-tax-info';
import type { TaxInfo, TaxGetInfo } from './types';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';
import type { FunctionComponent, ReactNode } from 'react';

import './style.scss';

function TaxInfoButtonContents( {
	taxInfoFromServer,
}: {
	taxInfoFromServer: TaxGetInfo | undefined;
} ) {
	const translate = useTranslate();
	if ( taxInfoFromServer?.tax_country_code ) {
		const taxInfoDisplay = joinNonEmptyValues(
			', ',
			taxInfoFromServer?.tax_postal_code,
			taxInfoFromServer?.tax_country_code
		);
		return <>{ taxInfoDisplay }</>;
	}
	const text = translate( 'Fix missing data' );
	return (
		<>
			<Gridicon icon="notice" />
			{ text }
		</>
	);
}

const PaymentMethodEditDialog: FunctionComponent< {
	paymentMethodSummary: ReactNode;
	isVisible: boolean;
	onClose: () => void;
	onConfirm: () => void;
	onChange: ( input: ManagedContactDetails ) => void;
	error: string;
	storedDetailsId: string;
	value: ManagedContactDetails;
} > = ( {
	paymentMethodSummary,
	isVisible,
	onClose,
	onConfirm,
	error,
	onChange,
	storedDetailsId,
	value,
} ) => {
	const translate = useTranslate();
	const countriesList = useCountryList();

	return (
		<Dialog
			isVisible={ isVisible }
			additionalClassNames="payment-method-edit-dialog"
			onClose={ onClose }
			buttons={ [
				<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>,
				<Button onClick={ onConfirm } primary>
					{ translate( 'Save' ) }
				</Button>,
			] }
		>
			<CardHeading tagName="h2" size={ 24 }>
				<strong>{ paymentMethodSummary }</strong>
			</CardHeading>
			{ error && <Notice status="is-error" isCompact text={ error } /> }
			<TaxFields
				section={ `existing-card-payment-method-${ storedDetailsId }` }
				taxInfo={ value }
				countriesList={ countriesList }
				onChange={ onChange }
			/>
		</Dialog>
	);
};

export function getMissingTaxLocationInformationMessage(
	translate: ReturnType< typeof useTranslate >,
	taxInfoFromServer: TaxGetInfo | undefined
): string {
	const description = ! taxInfoFromServer?.tax_country_code
		? translate( 'Country', { textOnly: true } )
		: translate( 'Postal code', { textOnly: true } );
	return translate( 'Missing required %(description)s field', {
		args: { description },
		textOnly: true,
	} );
}

function joinNonEmptyValues( joinString: string, ...values: ( string | undefined )[] ) {
	return values.filter( ( value ) => value && value?.length > 0 ).join( joinString );
}

function contactDetailsToTaxInfo( info?: TaxInfo ): ManagedContactDetails {
	const taxInfo: ManagedContactDetails = {
		countryCode: {
			value: info?.tax_country_code ?? '',
			isTouched: true,
			errors: [],
		},
		postalCode: {
			value: info?.tax_postal_code ?? '',
			isTouched: true,
			errors: [],
		},
	};
	if ( info?.tax_subdivision_code ) {
		taxInfo.state = {
			value: info.tax_subdivision_code,
			isTouched: true,
			errors: [],
		};
	}
	if ( info?.tax_city ) {
		taxInfo.city = {
			value: info.tax_city,
			isTouched: true,
			errors: [],
		};
	}
	if ( info?.tax_organization ) {
		taxInfo.organization = {
			value: info.tax_organization,
			isTouched: true,
			errors: [],
		};
	}
	if ( info?.tax_address ) {
		taxInfo.address1 = {
			value: info.tax_address,
			isTouched: true,
			errors: [],
		};
	}
	return taxInfo;
}

export function TaxInfoArea( {
	last4,
	brand,
	storedDetailsId,
	paymentPartnerProcessorId,
}: {
	last4?: string;
	brand?: string;
	storedDetailsId: string;
	paymentPartnerProcessorId: string;
} ) {
	const translate = useTranslate();
	const { formStatus } = useFormStatus();

	const [ isDialogVisible, setIsDialogVisible ] = useState( false );
	const [ inputValues, setInputValues ] = useState< ManagedContactDetails >( {
		countryCode: { value: '', isTouched: false, errors: [] },
		postalCode: { value: '', isTouched: false, errors: [] },
	} );
	const [ updateError, setUpdateError ] = useState( '' );
	const closeDialog = useCallback( () => {
		setUpdateError( '' );
		setIsDialogVisible( false );
	}, [] );

	const {
		isLoading,
		taxInfo: taxInfoFromServer,
		setTaxInfo,
	} = usePaymentMethodTaxInfo( storedDetailsId );

	const openDialog = useCallback( () => {
		setInputValues( contactDetailsToTaxInfo( taxInfoFromServer ) );
		setIsDialogVisible( true );
	}, [ taxInfoFromServer ] );

	// Any time the server data changes, update the form data.
	useEffect( () => {
		if ( ! taxInfoFromServer?.tax_country_code ) {
			return;
		}
		setInputValues( contactDetailsToTaxInfo( taxInfoFromServer ) );
	}, [ taxInfoFromServer ] );

	const updateTaxInfo = useCallback( () => {
		setTaxInfo( {
			tax_country_code: inputValues?.countryCode?.value ?? '',
			tax_postal_code: inputValues?.postalCode?.value ?? '',
			tax_subdivision_code: inputValues?.state?.value,
			tax_city: inputValues?.city?.value,
			tax_organization: inputValues?.organization?.value,
			tax_address: inputValues?.address1?.value,
		} )
			.then( closeDialog )
			.catch( setUpdateError );
	}, [ setTaxInfo, inputValues, closeDialog ] );

	const onChangeTaxInfo = ( info: ManagedContactDetails ) => {
		setInputValues( info );
	};

	if ( isLoading ) {
		return null;
	}

	const isTaxInfoComplete = !! taxInfoFromServer?.tax_country_code;

	return (
		<div className="payment-method-tax-info">
			<span className="payment-method-tax-info__address">
				{ translate( 'Billing information:', { textOnly: true } ) }
			</span>
			<Button
				scary={ ! isTaxInfoComplete }
				borderless
				className="payment-method-tax-info__edit-button"
				onClick={ openDialog }
				disabled={ formStatus !== FormStatus.READY }
			>
				<TaxInfoButtonContents taxInfoFromServer={ taxInfoFromServer } />
			</Button>
			<PaymentMethodEditDialog
				paymentMethodSummary={
					<PaymentMethodSummary type={ brand || paymentPartnerProcessorId } digits={ last4 } />
				}
				isVisible={ isDialogVisible }
				onClose={ closeDialog }
				onConfirm={ updateTaxInfo }
				value={ inputValues }
				storedDetailsId={ storedDetailsId }
				onChange={ onChangeTaxInfo }
				error={ updateError }
			/>
		</div>
	);
}
