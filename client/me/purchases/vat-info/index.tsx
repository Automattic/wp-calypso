/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useTranslate } from 'i18n-calypso';
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

import './style.scss';

export default function VatInfoPage(): JSX.Element {
	const translate = useTranslate();
	const [ currentVatDetails, setCurrentVatDetails ] = useState< VatDetails >( {} );
	const {
		vatDetails,
		isLoading,
		isUpdating,
		fetchError,
		updateError,
		setVatDetails,
	} = useVatDetails();

	const saveDetails = () => {
		setVatDetails( { ...vatDetails, ...currentVatDetails } );
	};

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
				<VatUpdateErrorNotice error={ updateError } />

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
							"We currently only provide VAT invoices to users who are properly listed in the VIES (VAT Information Exchange System) or the UK VAT database. VAT information saved on this page will be applied to all of your account's receipts."
						) }
					</p>
				</Card>
			</Column>
		</Layout>
	);
}

function VatUpdateErrorNotice( { error }: { error: UpdateError | null } ): JSX.Element | null {
	const translate = useTranslate();
	if ( ! error ) {
		return null;
	}

	if ( error.error === 'validation_failed' ) {
		return (
			<CompactCard highlight="error">
				{ translate( 'Your VAT details are not valid. Please check each field and try again.' ) }
			</CompactCard>
		);
	}

	return (
		<CompactCard highlight="error">
			{ translate( 'An error occurred while updating your VAT details.' ) }
		</CompactCard>
	);
}
