// eslint-disable-next-line no-restricted-imports
import { ValidatedInputControl } from '@automattic/components/src/validated-form-controls/components/input-control';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	Button,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isValidIpAddress, isValidNameServerSubdomain } from '../../utils/domain';
import type { DomainGlueRecord } from '../../data/domain-glue-records';
import type { Field } from '@wordpress/dataviews';

export interface FormData {
	nameServer: string;
	ipAddress: string;
}

interface DomainGlueRecordsFormProps {
	domainName: string;
	initialData?: DomainGlueRecord | null;
	onSubmit: ( data: FormData ) => void;
	isSubmitting: boolean;
	isEdit?: boolean;
	submitButtonText: string;
}

export default function DomainGlueRecordsForm( {
	domainName,
	initialData,
	onSubmit,
	isSubmitting,
	isEdit = false,
	submitButtonText,
}: DomainGlueRecordsFormProps ) {
	const [ formData, setFormData ] = useState< FormData >( () => {
		if ( ! initialData ) {
			return {
				nameServer: '',
				ipAddress: '',
			};
		}
		return {
			nameServer: initialData.nameserver,
			ipAddress: initialData.ip_addresses[ 0 ],
		};
	} );

	const fields: Field< FormData >[] = useMemo(
		() => [
			{
				id: 'nameServer',
				label: __( 'Name Server' ),
				placeholder: 'ns1',
				type: 'text' as const,
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					const suffix = `.${ domainName }`;
					const value = getValue( { item: data } ).replace( suffix, '' );

					return (
						<ValidatedInputControl
							label={ field.label }
							placeholder={ field.placeholder }
							value={ value }
							onChange={ ( value ) => {
								return onChange( { [ id ]: value + suffix } );
							} }
							customValidator={ ( value ) => {
								if ( ! value || ! isValidNameServerSubdomain( value ) ) {
									return __( 'Please enter a valid name server.' );
								}
							} }
							required
							suffix={ <InputControlSuffixWrapper>{ suffix }</InputControlSuffixWrapper> }
						/>
					);
				},
				readOnly: isEdit,
			},
			{
				id: 'ipAddress',
				label: __( 'IP Address' ),
				placeholder: '123.45.78.9',
				type: 'text',
				isValid: {
					required: true,
					custom: ( item ) => {
						if ( ! isValidIpAddress( item.ipAddress ) ) {
							return __( 'Please enter a valid IP address.' );
						}
						return null;
					},
				},
			},
		],
		[ domainName ]
	);

	const form = {
		type: 'regular' as const,
		fields: [ 'nameServer', 'ipAddress' ],
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		onSubmit( formData );
	};

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<DataForm< FormData >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< FormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>

						<HStack justify="start" spacing={ 4 }>
							<Button
								variant="primary"
								type="submit"
								isBusy={ isSubmitting }
								disabled={ isSubmitting }
							>
								{ submitButtonText }
							</Button>
						</HStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}
