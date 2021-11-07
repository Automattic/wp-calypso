import {
	Field,
	tryToGuessPostalCodeFormat,
	getCountryPostalCodeSupport,
} from '@automattic/wpcom-checkout';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { isValid } from '../types/wpcom-store-state';
import CountrySelectMenu from './country-select-menu';
import { LeftColumn, RightColumn } from './ie-fallback';
import type { CountryListItem, ManagedContactDetails } from '@automattic/wpcom-checkout';
import type { ChangeEvent } from 'react';

const GridRow = styled.div`
	display: -ms-grid;
	display: grid;
	width: 100%;
	-ms-grid-columns: 48% 4% 48%;
	grid-template-columns: 48% 48%;
	grid-column-gap: 4%;
	justify-items: stretch;
`;

const FieldRow = styled( GridRow )`
	margin-top: 16px;

	:first-of-type {
		margin-top: 0;
	}
`;

export default function TaxFields( {
	section,
	taxInfo,
	countriesList,
	updatePostalCode,
	updateCountryCode,
	isDisabled,
}: {
	section: string;
	taxInfo: ManagedContactDetails;
	countriesList: CountryListItem[];
	updatePostalCode: ( code: string ) => void;
	updateCountryCode: ( code: string ) => void;
	isDisabled: boolean;
} ): JSX.Element {
	const translate = useTranslate();
	const { postalCode, countryCode } = taxInfo;
	const arePostalCodesSupported = getCountryPostalCodeSupport(
		countriesList,
		countryCode?.value ?? ''
	);

	return (
		<FieldRow>
			<LeftColumn>
				<CountrySelectMenu
					translate={ translate }
					onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
						updateCountryCode( event.target.value );
						// Reformat the postal code if the country changes
						if ( postalCode ) {
							updatePostalCode(
								getCountryPostalCodeSupport( countriesList, event.target.value )
									? tryToGuessPostalCodeFormat( postalCode?.value, event.target.value )
									: ''
							);
						}
					} }
					isError={ countryCode?.isTouched && ! isValid( countryCode ) }
					isDisabled={ isDisabled }
					errorMessage={ countryCode?.errors[ 0 ] ?? translate( 'This field is required.' ) }
					currentValue={ countryCode?.value }
					countriesList={ countriesList }
				/>
			</LeftColumn>

			{ arePostalCodesSupported && (
				<RightColumn>
					<Field
						id={ section + '-postal-code' }
						type="text"
						label={ String( translate( 'Postal code' ) ) }
						value={ postalCode?.value ?? '' }
						disabled={ isDisabled }
						onChange={ ( newValue ) =>
							updatePostalCode(
								tryToGuessPostalCodeFormat( newValue.toUpperCase(), countryCode?.value )
							)
						}
						autoComplete={ section + ' postal-code' }
						isError={ postalCode?.isTouched && ! isValid( postalCode ) }
						errorMessage={
							postalCode?.errors[ 0 ] ?? String( translate( 'This field is required.' ) )
						}
					/>
				</RightColumn>
			) }
		</FieldRow>
	);
}
