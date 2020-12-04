/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Field from './field';
import { LeftColumn, RightColumn } from './ie-fallback';
import { isValid } from '../types/wpcom-store-state';
import CountrySelectMenu from './country-select-menu';
import type { CountryListItem } from '../types/country-list-item';
import type { ManagedContactDetails } from '../types/wpcom-store-state';

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

	return (
		<FieldRow>
			<LeftColumn>
				<Field
					id={ section + '-postal-code' }
					type="text"
					label={ String( translate( 'Postal code' ) ) }
					value={ postalCode?.value ?? '' }
					disabled={ isDisabled }
					onChange={ updatePostalCode }
					autoComplete={ section + ' postal-code' }
					isError={ postalCode?.isTouched && ! isValid( postalCode ) }
					errorMessage={ String( translate( 'This field is required.' ) ) }
				/>
			</LeftColumn>

			<RightColumn>
				<CountrySelectMenu
					translate={ translate }
					onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) => {
						updateCountryCode( event.target.value );
					} }
					isError={ countryCode?.isTouched && ! isValid( countryCode ) }
					isDisabled={ isDisabled }
					errorMessage={ translate( 'This field is required.' ) }
					currentValue={ countryCode?.value }
					countriesList={ countriesList }
				/>
			</RightColumn>
		</FieldRow>
	);
}

TaxFields.propTypes = {
	section: PropTypes.string.isRequired,
	taxInfo: PropTypes.object.isRequired,
	updatePostalCode: PropTypes.func.isRequired,
	updateCountryCode: PropTypes.func.isRequired,
	isDisabled: PropTypes.bool,
};
