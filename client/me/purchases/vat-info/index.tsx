/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { CompactCard, Button } from '@automattic/components';

/**
 * Internal dependencies
 */
import SectionHeader from 'calypso/components/section-header';
import useVatDetails from './use-vat-details';

export default function VatInfoPage(): JSX.Element {
	const translate = useTranslate();
	const { vatDetails, isLoading, error } = useVatDetails();

	if ( error ) {
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

	const saveDetails = () => {};

	return (
		<div className="vat-info">
			<SectionHeader label={ translate( 'VAT Details' ) } />

			<CompactCard>
				<div>
					<label>{ translate( 'Country' ) }</label>
					<input value={ vatDetails.country ?? '' } />
				</div>
				<div>
					<label>{ translate( 'VAT' ) }</label>
					<input value={ vatDetails.id ?? '' } />
				</div>
				<div>
					<label>{ translate( 'Name' ) }</label>
					<input value={ vatDetails.name ?? '' } />
				</div>
				<div>
					<label>{ translate( 'Address' ) }</label>
					<input value={ vatDetails.address ?? '' } />
				</div>

				<Button onClick={ saveDetails }>{ translate( 'Validate and save' ) }</Button>
			</CompactCard>
		</div>
	);
}
