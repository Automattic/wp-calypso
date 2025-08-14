import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { domainDnsApplyTemplateMutation } from '../../app/queries/domain-dns-records';
import { domainRoute } from '../../app/routes/domain-routes';

import './email-setup-form.scss';

export type EmailSetupFormData = {
	record: string;
};

const form = {
	type: 'regular' as const,
	fields: [ 'record' ],
};

const defaultFormData: EmailSetupFormData = {
	record: '',
};

interface EmailSetupFormProps {
	description: string;
	label: string;
	modifyVariables?: ( variables: { token: string; domain: string; mxdata?: string } ) => {
		token: string;
		domain: string;
		mxdata?: string;
	};
	pattern: RegExp;
	placeholder: string;
	provider: string;
	service: string;
	submitLabel: string;
}

export default function EmailSetupForm( {
	description,
	label,
	modifyVariables,
	pattern,
	placeholder,
	provider,
	service,
	submitLabel,
}: EmailSetupFormProps ) {
	const { domainName } = domainRoute.useParams();
	const [ formData, setFormData ] = useState< EmailSetupFormData >( defaultFormData );
	const [ isPending, setIsPending ] = useState( false );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );

	const mutation = useMutation( domainDnsApplyTemplateMutation( domainName ) );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		setIsPending( true );
		let variables: {
			token: string;
			domain: string;
			mxdata?: string;
		} = {
			token: formData.record,
			domain: domainName,
		};
		if ( modifyVariables ) {
			variables = modifyVariables( variables );
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
					setIsPending( false );
				},
			}
		);
	};

	const fields: Field< EmailSetupFormData >[] = [
		{
			id: 'record',
			type: 'text',
			label,
			description,
			placeholder,
			isValid: {
				custom: ( item ) => {
					return pattern.test( item.record ) ? null : __( 'Invalid verification record format' );
				},
				required: true,
			},
		},
	];

	return (
		<div className="email-setup-form">
			<form onSubmit={ handleSubmit }>
				<VStack spacing={ 4 }>
					<DataForm< EmailSetupFormData >
						data={ formData }
						fields={ fields }
						form={ form }
						onChange={ ( edits: Partial< EmailSetupFormData > ) => {
							setFormData( ( data ) => ( { ...data, ...edits } ) );
						} }
					/>
					<HStack justify="flex-start">
						<Button variant="primary" type="submit" isBusy={ isPending } disabled={ isPending }>
							{ submitLabel }
						</Button>
					</HStack>
				</VStack>
			</form>
		</div>
	);
}
