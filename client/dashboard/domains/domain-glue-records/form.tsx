import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalInputControl as InputControl,
	__experimentalInputControlSuffixWrapper as InputControlSuffixWrapper,
	Button,
} from '@wordpress/components';
import { DataForm, isItemValid } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ButtonStack } from '../../components/button-stack';
import { Text } from '../../components/text';
import { isValidIpAddress, isValidNameServerSubdomain } from '../../utils/domain';
import type { DomainGlueRecord } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

export interface FormData {
	nameServer: string;
	ipAddress: string;
}

interface DomainGlueRecordsFormProps {
	domainName: string;
	initialData?: DomainGlueRecord | null;
	onSubmit: ( data: DomainGlueRecord ) => void;
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
				label: __( 'Name server' ),
				placeholder: 'ns1',
				type: 'text' as const,
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					const suffix = `.${ domainName }`;
					const value = getValue( { item: data } ).replace( suffix, '' );

					return (
						// TODO: Show the error via Data Form when the ValidatedInputControl component is ready.
						<InputControl
							__next40pxDefaultSize
							label={ field.label }
							placeholder={ field.placeholder }
							value={ value }
							onChange={ ( value ) => {
								return onChange( { [ id ]: value + suffix } );
							} }
							suffix={
								<InputControlSuffixWrapper>
									<Text variant="muted">{ suffix }</Text>
								</InputControlSuffixWrapper>
							}
						/>
					);
				},
				isValid: {
					required: true,
					custom: ( item ) => {
						if ( ! isValidNameServerSubdomain( item.nameServer ) ) {
							return __( 'Please enter a valid name server.' );
						}
						return null;
					},
				},
				readOnly: isEdit,
			},
			{
				id: 'ipAddress',
				label: __( 'IP address' ),
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
		[ domainName, isEdit ]
	);

	const form = {
		type: 'regular' as const,
		fields: [ 'nameServer', 'ipAddress' ],
	};

	const canSubmit = ! isSubmitting && isItemValid( formData, fields, form );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		const glueRecord = {
			nameserver: formData.nameServer,
			ip_addresses: [ formData.ipAddress ],
		};

		onSubmit( glueRecord );
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

						<ButtonStack justify="start">
							<Button
								variant="primary"
								type="submit"
								isBusy={ isSubmitting }
								disabled={ ! canSubmit }
							>
								{ submitButtonText }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}
