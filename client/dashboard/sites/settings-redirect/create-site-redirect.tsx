import { productsQuery, domainCanRedirectQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
	Card,
	CardBody,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field, isItemValid } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { ButtonStack } from '../../components/button-stack';
import { validateHostname } from '../../domains/name-servers/utils';
import RedirectInputField from './redirect-input-field';

interface FormData {
	redirect: string;
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
	const [ formData, setFormData ] = useState< FormData >( { redirect: '' } );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const { refetch } = useQuery( {
		...domainCanRedirectQuery( siteId, formData.redirect ),
		enabled: false,
	} );

	const fields: Field< FormData >[] = useMemo(
		() => [
			{
				id: 'redirect',
				type: 'text',
				Edit: ( { field, data, onChange } ) => {
					const { id, getValue } = field;
					return (
						<RedirectInputField
							value={ getValue( { item: data } ) }
							onChange={ ( value ) => onChange( { [ id ]: value } ) }
						/>
					);
				},
				isValid: {
					required: true,
					custom: ( formData: FormData ) => {
						const value = formData.redirect;
						return validateHostname( value ) ? null : __( 'Please enter a valid hostname' );
					},
				},
			},
		],
		[]
	);

	if ( ! offsetRedirect ) {
		return null;
	}

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'redirect' ],
	};
	const isFormValid = isItemValid( formData, fields, form );

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
				meta: formData.redirect,
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
					<Text as="p">
						{ offsetRedirect?.cost_display }
						<small>{ __( '/year' ) }</small>
					</Text>
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
									disabled={ isSubmitting || ! isFormValid }
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
