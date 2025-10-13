import {
	CheckboxControl,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { type Field } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
import { RegionAddressFieldsets } from './region-address-fieldsets';
import type { CountryListItem } from './custom-form-fieldsets/types';
import type { DomainContactDetails, StatesListItem } from '@automattic/api-core';

export const getContactFormFields = (
	countryList: CountryListItem[] | undefined,
	statesList: StatesListItem[] | undefined,
	countryCode: string
): Field< DomainContactDetails >[] => {
	return [
		{
			id: 'firstName',
			label: __( 'First name' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'lastName',
			label: __( 'Last name' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'organization',
			label: __( 'Organization' ),
			type: 'text',
		},
		{
			id: 'email',
			label: __( 'Email' ),
			type: 'email',
			isValid: {
				required: true,
			},
		},
		{
			id: 'phone',
			label: __( 'Phone' ),
			type: 'text',
			isValid: {
				required: true,
			},
		},
		{
			id: 'countryCode',
			label: __( 'Country' ),
			type: 'text',
			elements:
				countryList?.map( ( country ) => ( {
					label: country.name,
					value: country.code,
				} ) ) ?? [],
			isValid: {
				required: true,
			},
		},
		...RegionAddressFieldsets( statesList, countryCode ),
		{
			id: 'optOutTransferLock',
			label: __( 'Opt-out of the 60-day transfer lock' ),
			type: 'boolean',
			Edit: ( { field, onChange, data, hideLabelFromVision } ) => {
				const { id, getValue } = field;
				return (
					<HStack spacing={ 0 } alignment="start" justify="flex-start">
						<CheckboxControl
							label=""
							checked={ getValue( { item: data } ) }
							onChange={ () => onChange( { [ id ]: ! getValue( { item: data } ) } ) }
						/>
						{ ! hideLabelFromVision && (
							<Text>
								{ createInterpolateElement(
									sprintf(
										/* translators: %s: "what is this?" link */
										__( 'Opt-out of the 60-day transfer lock. <link>%s</link>' ),
										__( 'What is this?' )
									),
									{
										link: <InlineSupportLink supportContext="60-day-transfer-lock" />,
									}
								) }
							</Text>
						) }
					</HStack>
				);
			},
		},
	];
};
