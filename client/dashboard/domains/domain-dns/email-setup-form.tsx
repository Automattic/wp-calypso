// import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { DataForm, Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
// import { domainRoute } from '../../app/routes/domain-routes';
// import { emailSetupMutation } from '../../data/domain-dns-records';

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
	placeholder: string;
	label: string;
	description: string;
	submitLabel: string;
	pattern: RegExp;
}

export default function EmailSetupForm( {
	placeholder,
	label,
	description,
	submitLabel,
	pattern,
}: EmailSetupFormProps ) {
	// const { domainName } = domainRoute.useParams();
	const [ formData, setFormData ] = useState< EmailSetupFormData >( defaultFormData );
	const [ isPending, setIsPending ] = useState( false );

	// const mutation = useMutation( emailSetupMutation( domainName ) );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		setIsPending( true );
		// mutation.mutate( {
		// 	record: formData.record,
		// } );
		// TODO: Implement the form submission
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
