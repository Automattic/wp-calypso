import { productsQuery, domainCanRedirectQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Card, CardBody, __experimentalVStack as VStack, Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field } from '@wordpress/dataviews';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { ButtonStack } from '../../components/button-stack';
import { validateHostname } from '../../domains/name-servers/utils';

interface FormData {
	redirectUrl: string;
}

export default function CreateSiteRedirect( {
	siteSlug,
	siteId,
}: {
	siteSlug: string;
	siteId: number;
} ) {
	const { data: products } = useSuspenseQuery( productsQuery() );
	const { createErrorNotice } = useDispatch( noticesStore );
	const offsetRedirect = products?.offsite_redirect;
	const [ formData, setFormData ] = useState< FormData >( { redirectUrl: '' } );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const { refetch } = useQuery( {
		...domainCanRedirectQuery( siteId, formData.redirectUrl ),
		enabled: false,
	} );

	if ( ! offsetRedirect ) {
		return null;
	}

	const fields: Field< FormData >[] = [
		{
			id: 'redirectUrl',
			label: __( 'Redirect URL' ),
			type: 'text',
			placeholder: __( 'Enter destination URL' ),
			isValid: {
				required: true,
				custom: ( formData: FormData ) => {
					const value = formData.redirectUrl;
					return validateHostname( value ) ? null : __( 'Please enter a valid hostname' );
				},
			},
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'redirectUrl' ],
	};

	const handleSubmit = async ( e: React.FormEvent ) => {
		e.preventDefault();
		setIsSubmitting( true );
		const backUrl = window.location.href.replace( window.location.origin, '' );
		const { shoppingCartManagerClient } = await import(
			/* webpackChunkName: "async-load-shopping-cart" */ '../../app/shopping-cart'
		);
		const { data, isError, error } = await refetch();
		if ( isError || ! data.can_redirect ) {
			createErrorNotice( error?.message ?? __( 'Something went wrong' ), { type: 'snackbar' } );
			setIsSubmitting( false );
			return;
		}
		await shoppingCartManagerClient.forCartKey( siteId ).actions.replaceProductsInCart( [
			{
				product_slug: offsetRedirect?.product_slug,
				meta: formData.redirectUrl,
			},
		] );
		window.location.href = addQueryArgs( `/checkout/${ siteSlug }`, {
			cancel_to: backUrl,
			redirect_to: backUrl,
		} );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<div>{ offsetRedirect?.cost_display }</div>
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
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									__next40pxDefaultSize
									isBusy={ isSubmitting }
								>
									{ __( 'GO' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</form>
				</VStack>
			</CardBody>
		</Card>
	);
}
