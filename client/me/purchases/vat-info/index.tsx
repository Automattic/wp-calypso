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
import type { VatDetails } from './use-vat-details';

export default function VatInfoPage(): JSX.Element {
	const translate = useTranslate();
	const [ currentVatDetails, setCurrentVatDetails ] = useState< VatDetails >( {} );
	const { vatDetails, isLoading, error, setVatDetails } = useVatDetails();

	const saveDetails = () => {
		setVatDetails( { ...vatDetails, ...currentVatDetails } );
	};

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

	return (
		<div className="vat-info">
			<SectionHeader label={ translate( 'VAT Details' ) } />

			<CompactCard>
				<div>
					<label>{ translate( 'Country' ) }</label>
					<input
						value={ currentVatDetails.country ?? vatDetails.country ?? '' }
						onChange={ ( event ) =>
							setCurrentVatDetails( { ...currentVatDetails, country: event.target.value } )
						}
					/>
				</div>
				<div>
					<label>{ translate( 'VAT' ) }</label>
					<input
						value={ currentVatDetails.id ?? vatDetails.id ?? '' }
						onChange={ ( event ) =>
							setCurrentVatDetails( { ...currentVatDetails, id: event.target.value } )
						}
					/>
				</div>
				<div>
					<label>{ translate( 'Name' ) }</label>
					<input
						value={ currentVatDetails.name ?? vatDetails.name ?? '' }
						onChange={ ( event ) =>
							setCurrentVatDetails( { ...currentVatDetails, name: event.target.value } )
						}
					/>
				</div>
				<div>
					<label>{ translate( 'Address' ) }</label>
					<input
						value={ currentVatDetails.address ?? vatDetails.address ?? '' }
						onChange={ ( event ) =>
							setCurrentVatDetails( { ...currentVatDetails, address: event.target.value } )
						}
					/>
				</div>

				<Button onClick={ saveDetails }>{ translate( 'Validate and save' ) }</Button>
			</CompactCard>
		</div>
	);
}
