import { localize, LocalizeProps } from 'i18n-calypso';
import { includes } from 'lodash';
import { Component } from 'react';
import { Input, HiddenInput } from 'calypso/my-sites/domains/components/form';
import {
	CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES,
	CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES,
} from './constants';
import EuAddressFieldset from './eu-address-fieldset';
import UkAddressFieldset from './uk-address-fieldset';
import UsAddressFieldset from './us-address-fieldset';
import type { FieldProps } from '../managed-contact-details-form-fields';
import type { DomainContactDetailsErrors } from '@automattic/wpcom-checkout';

export interface RegionAddressFieldsetsProps {
	countryCode: string;
	shouldAutoFocusAddressField?: boolean;
	arePostalCodesSupported?: boolean;
	hasCountryStates?: boolean;
	contactDetailsErrors: DomainContactDetailsErrors;
	getFieldProps: (
		name: string,
		options: {
			customErrorMessage?: DomainContactDetailsErrors[ 'firstName' ];
			needsChildRef?: boolean;
		}
	) => FieldProps;
}

export class RegionAddressFieldsets extends Component<
	RegionAddressFieldsetsProps & LocalizeProps
> {
	static defaultProps = {
		countryCode: 'US',
		shouldAutoFocusAddressField: false,
		arePostalCodesSupported: true,
		hasCountryStates: false,
	};

	inputRefCallback( input: { focus: () => void } | undefined | null ) {
		input && input.focus();
	}

	getRegionAddressFieldset() {
		const { countryCode, hasCountryStates } = this.props;

		if ( ! hasCountryStates ) {
			if ( includes( CHECKOUT_EU_ADDRESS_FORMAT_COUNTRY_CODES, countryCode ) ) {
				return <EuAddressFieldset { ...this.props } />;
			}

			if ( includes( CHECKOUT_UK_ADDRESS_FORMAT_COUNTRY_CODES, countryCode ) ) {
				return <UkAddressFieldset { ...this.props } />;
			}
		}

		return <UsAddressFieldset { ...this.props } />;
	}

	render() {
		const { getFieldProps, translate, shouldAutoFocusAddressField } = this.props;

		return (
			<div>
				<div>
					<Input
						ref={ shouldAutoFocusAddressField ? this.inputRefCallback : undefined }
						label={ translate( 'Address' ) }
						maxLength={ 40 }
						{ ...getFieldProps( 'address-1', {
							customErrorMessage: this.props.contactDetailsErrors?.address1,
						} ) }
					/>

					<HiddenInput
						label={ translate( 'Address Line 2' ) }
						text={ translate( '+ Add Address Line 2' ) }
						maxLength={ 40 }
						{ ...getFieldProps( 'address-2', {
							needsChildRef: true,
							customErrorMessage: this.props.contactDetailsErrors?.address2,
						} ) }
					/>
				</div>
				{ this.getRegionAddressFieldset() }
			</div>
		);
	}
}
export default localize( RegionAddressFieldsets );
