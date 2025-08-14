import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isValidNameServer, isValidIpAddress } from './utils';
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
				placeholder: 'ns1.' + domainName,
				type: 'text' as const,
				readOnly: isEdit,
				isValid: {
					custom: ( item ) => {
						if ( ! isValidNameServer( item.nameServer ) ) {
							return __( 'Please enter a valid name server.' );
						}
						return null;
					},
				},
			},
			{
				id: 'ipAddress',
				label: __( 'IP Address' ),
				placeholder: '123.45.67.89',
				type: 'text',
				isValid: {
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
