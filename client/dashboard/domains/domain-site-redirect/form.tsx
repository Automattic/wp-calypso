import { siteRedirectUpdateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, Card, CardBody } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field, isItemValid } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { domainSiteRedirectRoute } from '../../app/router/domains';
import { ButtonStack } from '../../components/button-stack';

export type FormData = {
	redirect: string;
};

const form = {
	layout: { type: 'regular' as const },
	fields: [ 'redirect' ],
};

interface Props {
	siteId: number;
	initialData: FormData;
}

export default function DomainRedirectForm( { siteId, initialData }: Props ) {
	const [ formData, setFormData ] = useState< FormData >( initialData );
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const navigate = useNavigate();

	const fields: Field< FormData >[] = [
		{
			id: 'redirect',
			type: 'text',
			label: __( 'Redirect' ),
			description: __(
				'All domains on this site will redirect here as long as this domain is set as your primary domain.'
			),
			isValid: {
				required: true,
			},
		},
	];

	const updateSiteRedirectMutation = useMutation( {
		...siteRedirectUpdateMutation( siteId ),
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		updateSiteRedirectMutation.mutate( formData.redirect, {
			onSuccess: () => {
				createSuccessNotice( __( 'Site redirect updated.' ), { type: 'snackbar' } );

				navigate( {
					to: domainSiteRedirectRoute.fullPath,
					params: { domainName: formData.redirect },
					replace: true,
				} );
			},
			onError: ( error: Error ) => {
				createErrorNotice( error.message, {
					type: 'snackbar',
				} );
			},
		} );
	};

	const canSubmit = ! updateSiteRedirectMutation.isPending && isItemValid( formData, fields, form );

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 5 }>
						<DataForm< FormData >
							data={ formData }
							fields={ fields }
							form={ form }
							onChange={ ( edits: Partial< FormData > ) => {
								setFormData( ( data ) => ( { ...data, ...edits } ) );
							} }
						/>
						<ButtonStack>
							<Button
								type="submit"
								variant="primary"
								isBusy={ updateSiteRedirectMutation.isPending }
								disabled={ ! canSubmit }
							>
								{ __( 'Update' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}
