/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { CompactCard, Button, Card } from '@automattic/components';

/**
 * Internal dependencies
 */
import Layout from 'calypso/components/layout';
import Column from 'calypso/components/layout/column';
import CardHeading from 'calypso/components/card-heading';
import useVatDetails from './use-vat-details';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormTextInput from 'calypso/components/forms/form-text-input';
import type { VatDetails, UpdateError } from './use-vat-details';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

import './style.scss';

export default function VatInfoPage(): JSX.Element {
	const translate = useTranslate();
	const [ currentVatDetails, setCurrentVatDetails ] = useState< VatDetails >( {} );
	const {
		vatDetails,
		isLoading,
		isUpdating,
		isUpdateSuccessful,
		fetchError,
		updateError,
		setVatDetails,
	} = useVatDetails();

	const saveDetails = () => {
		setVatDetails( { ...vatDetails, ...currentVatDetails } );
	};

	useDisplayVatNotices( { error: updateError, success: isUpdateSuccessful } );

	if ( fetchError ) {
		return (
			<div className="vat-info">
				<CompactCard>{ translate( 'An error occurred while fetching VAT details.' ) }</CompactCard>
			</div>
		);
	}

	if ( isLoading ) {
		return (
			<div className="vat-info">
				<CompactCard>{ translate( 'Loading…' ) }</CompactCard>
			</div>
		);
	}

	return (
		<Layout>
			<Column type="main" className="vat-info">
				<CompactCard>
					<FormFieldset className="vat-info__country-field">
						<FormLabel htmlFor="country">{ translate( 'Country' ) }</FormLabel>
						<FormTextInput
							name="country"
							disabled={ isUpdating }
							value={ currentVatDetails.country ?? vatDetails.country ?? '' }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								setCurrentVatDetails( { ...currentVatDetails, country: event.target.value } )
							}
						/>
					</FormFieldset>
					<FormFieldset className="vat-info__vat-field">
						<FormLabel htmlFor="vat">{ translate( 'VAT Number' ) }</FormLabel>
						<FormTextInput
							name="vat"
							disabled={ isUpdating }
							value={ currentVatDetails.id ?? vatDetails.id ?? '' }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								setCurrentVatDetails( { ...currentVatDetails, id: event.target.value } )
							}
						/>
					</FormFieldset>
					<FormFieldset className="vat-info__name-field">
						<FormLabel htmlFor="name">{ translate( 'Name' ) }</FormLabel>
						<FormTextInput
							name="name"
							disabled={ isUpdating }
							value={ currentVatDetails.name ?? vatDetails.name ?? '' }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								setCurrentVatDetails( { ...currentVatDetails, name: event.target.value } )
							}
						/>
					</FormFieldset>
					<FormFieldset className="vat-info__address-field">
						<FormLabel htmlFor="address">{ translate( 'Address' ) }</FormLabel>
						<FormTextInput
							name="address"
							disabled={ isUpdating }
							value={ currentVatDetails.address ?? vatDetails.address ?? '' }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								setCurrentVatDetails( { ...currentVatDetails, address: event.target.value } )
							}
						/>
					</FormFieldset>

					<Button primary busy={ isUpdating } disabled={ isUpdating } onClick={ saveDetails }>
						{ translate( 'Validate and save' ) }
					</Button>
				</CompactCard>
			</Column>
			<Column type="sidebar">
				<Card className="vat-info__sidebar-card">
					<CardHeading tagName="h1" size={ 16 } isBold={ true } className="vat-info__sidebar-title">
						{ translate( 'VAT Information' ) }
					</CardHeading>
					<p className="vat-info__sidebar-paragraph">
						{ translate(
							"We currently only provide VAT invoices to users who are properly listed in the VIES (VAT Information Exchange System) or the UK VAT databases. VAT information saved on this page will be applied to all of your account's receipts."
						) }
					</p>
				</Card>
			</Column>
		</Layout>
	);
}

function useDisplayVatNotices( {
	error,
	success,
}: {
	error: UpdateError | null;
	success: boolean;
} ): void {
	const reduxDispatch = useDispatch();
	const translate = useTranslate();
	if ( error?.error === 'validation_failed' ) {
		reduxDispatch(
			errorNotice(
				translate( 'Your VAT details are not valid. Please check each field and try again.' )
			)
		);
		return;
	}

	if ( error ) {
		reduxDispatch(
			errorNotice( translate( 'An error occurred while updating your VAT details.' ) )
		);
		return;
	}

	if ( success ) {
		reduxDispatch( successNotice( translate( 'Your VAT details have been updated!' ) ) );
		return;
	}
}
