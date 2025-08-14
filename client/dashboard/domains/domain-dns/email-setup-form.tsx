import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
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
	pattern: RegExp;
	placeholder: string;
	provider: string;
	service: string;
	submitLabel: string;
}

export default function EmailSetupForm( {
	description,
	label,
	pattern,
	placeholder,
	provider,
	service,
	submitLabel,
}: EmailSetupFormProps ) {
	const { domainName } = domainRoute.useParams();
	const [ formData, setFormData ] = useState< EmailSetupFormData >( defaultFormData );
	const [ isPending, setIsPending ] = useState( false );

	const mutation = useMutation( domainDnsApplyTemplateMutation( domainName ) );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		setIsPending( true );
		mutation.mutate( {
			provider,
			service,
			variables: {
				token: formData.record,
				domain: domainName,
			},
		} );
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
