/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import { CompactCard, Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import SectionHeader from 'calypso/components/section-header';
import useVatDetails from './use-vat-details';
import type { VatDetails, UpdateError } from './use-vat-details';

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
				<SectionHeader label={ translate( 'VAT Details' ) } />

				<CompactCard>{ translate( 'An error occurred while fetching VAT details.' ) }</CompactCard>
			</div>
		);
	}

	if ( isLoading ) {
		return (
			<div className="vat-info">
				<SectionHeader label={ translate( 'VAT Details' ) } />

				<CompactCard>{ translate( 'Loading…' ) }</CompactCard>
			</div>
		);
	}

	return (
		<div className="vat-info">
			<SectionHeader label={ translate( 'VAT Details' ) } />

			<VatUpdateErrorNotice error={ updateError } />

			<CompactCard>
				<div>
					<label>{ translate( 'Country' ) }</label>
					<input
						disabled={ isUpdating }
						value={ currentVatDetails.country ?? vatDetails.country ?? '' }
						onChange={ ( event ) =>
							setCurrentVatDetails( { ...currentVatDetails, country: event.target.value } )
						}
					/>
				</div>
				<div>
					<label>{ translate( 'VAT' ) }</label>
					<input
						disabled={ isUpdating }
						value={ currentVatDetails.id ?? vatDetails.id ?? '' }
						onChange={ ( event ) =>
							setCurrentVatDetails( { ...currentVatDetails, id: event.target.value } )
						}
					/>
				</div>
				<div>
					<label>{ translate( 'Name' ) }</label>
					<input
						disabled={ isUpdating }
						value={ currentVatDetails.name ?? vatDetails.name ?? '' }
						onChange={ ( event ) =>
							setCurrentVatDetails( { ...currentVatDetails, name: event.target.value } )
						}
					/>
				</div>
				<div>
					<label>{ translate( 'Address' ) }</label>
					<input
						disabled={ isUpdating }
						value={ currentVatDetails.address ?? vatDetails.address ?? '' }
						onChange={ ( event ) =>
							setCurrentVatDetails( { ...currentVatDetails, address: event.target.value } )
						}
					/>
				</div>

				<Button busy={ isUpdating } disabled={ isUpdating } onClick={ saveDetails }>
					{ translate( 'Validate and save' ) }
				</Button>
			</CompactCard>
		</div>
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
