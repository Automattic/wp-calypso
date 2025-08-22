import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field, isItemValid } from '@wordpress/dataviews';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { domainDnsApplyTemplateMutation } from '../../app/queries/domain-dns-records';
import { domainRoute } from '../../app/router/domains';
import { type DnsTemplateVariables } from '../../data/domain-dns-records';

export type EmailSetupFormData = {
	record: string;
};

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'record' ],
};

const defaultFormData: EmailSetupFormData = {
	record: '',
};

interface EmailSetupFormProps {
	description: string;
	label: string;
	transformVariables?: ( variables: DnsTemplateVariables ) => DnsTemplateVariables;
	pattern: RegExp;
	placeholder: string;
	provider: string;
	service: string;
}

export default function EmailSetupForm( {
	description,
	label,
	transformVariables,
	pattern,
	placeholder,
	provider,
	service,
}: EmailSetupFormProps ) {
	const { domainName } = domainRoute.useParams();
	const [ formData, setFormData ] = useState< EmailSetupFormData >( defaultFormData );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const mutation = useMutation( domainDnsApplyTemplateMutation( domainName ) );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		let variables: DnsTemplateVariables = {
			token: formData.record,
			domain: domainName,
		};
		if ( transformVariables ) {
			variables = transformVariables( variables );
		}
		mutation.mutate(
			{
				provider,
				service,
				variables,
			},
			{
				onSuccess: () => {
					createSuccessNotice( __( 'Email setup completed successfully.' ), {
						type: 'snackbar',
					} );
				},
				onError: () => {
					createErrorNotice( __( 'Failed to complete email setup.' ), {
						type: 'snackbar',
					} );
				},
				onSettled: () => {
					setFormData( defaultFormData );
				},
			}
		);
	};

	const fields: Field< EmailSetupFormData >[] = [
		{
			id: 'record',
			type: 'text',
			label: __( 'Verification token' ),
			description,
			placeholder,
			isValid: {
				custom: ( item ) => {
					if ( ! item.record ) {
						return null;
					}
					return pattern.test( item.record ) ? null : __( 'Invalid verification record format.' );
				},
				required: false,
			},
		},
	];

	const canSubmit = formData.record && isItemValid( formData, fields, form );

	return (
		<div style={ { marginTop: '28px' } }>
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 5 }>
					<DataForm< EmailSetupFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits: Partial< EmailSetupFormData > ) => {
							setFormData( ( data ) => ( { ...data, ...edits } ) );
						} }
					/>
					<HStack justify="flex-start">
						<Button
							type="submit"
							variant="primary"
							isBusy={ mutation.isPending }
							disabled={ mutation.isPending || ! canSubmit }
							__next40pxDefaultSize
							accessibleWhenDisabled
						>
							{
								// translators: %(providerName)s will be replaced with the name of the service provider that this template is used for, for example Google Workspace or Office 365
								sprintf( __( 'Set up %(provider)s' ), {
									provider: label,
								} )
							}
						</Button>
					</HStack>
				</VStack>
			</form>
		</div>
	);
}
