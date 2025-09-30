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

const sanitizeRedirect = ( url: string ) => {
	return url.replace( /^https?:\/\//, '' ).replace( /\/$/, '' );
};

interface Props {
	siteId: number;
	initialData: FormData;
}

export default function DomainRedirectForm( { siteId, initialData }: Props ) {
	const [ formData, setFormData ] = useState< FormData >( initialData );
	const [ isLoading, setIsLoading ] = useState( false );
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
			placeholder: 'example.com',
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
		setIsLoading( true );

		const redirect = sanitizeRedirect( formData.redirect );
		setFormData( ( data ) => ( { ...data, ...{ redirect } } ) );

		updateSiteRedirectMutation.mutate( redirect, {
			onSuccess: () => {
				setTimeout( () => {
					setIsLoading( false );
					createSuccessNotice( __( 'Site redirect updated.' ), { type: 'snackbar' } );

					navigate( {
						to: domainSiteRedirectRoute.fullPath,
						params: { domainName: redirect },
						replace: true,
					} );
				}, 5000 ); // Simulate a 5-second delay so the backend has time to process the change.
			},
			onError: ( error: Error ) => {
				setIsLoading( false );
				createErrorNotice( error.message, {
					type: 'snackbar',
				} );
			},
		} );
	};

	const canSubmit = ! isLoading && isItemValid( formData, fields, form );

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
							<Button type="submit" variant="primary" isBusy={ isLoading } disabled={ ! canSubmit }>
								{ __( 'Update' ) }
							</Button>
						</ButtonStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}
