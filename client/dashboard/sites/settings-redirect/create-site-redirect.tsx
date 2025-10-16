import { productsQuery, domainCanRedirectQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, Card, CardBody } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { DataForm, Field, isItemValid } from '@wordpress/dataviews';
import { useState, useMemo } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { ButtonStack } from '../../components/button-stack';
import { Notice } from '../../components/notice';
import { validateHostname } from '../../domains/name-servers/utils';
import RedirectInputField from './redirect-input-field';

interface SiteRedirectFormData {
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
	const [ formData, setFormData ] = useState< SiteRedirectFormData >( { redirect: '' } );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const { refetch } = useQuery( {
		...domainCanRedirectQuery( siteId, formData.redirect ),
		enabled: false,
	} );

	const fields: Field< SiteRedirectFormData >[] = useMemo(
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
					custom: ( formData: SiteRedirectFormData ) => {
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
					<Notice variant="info" title={ __( 'Redirect your site' ) }>
						{ sprintf(
							/* translators: cost is the cost of the redirect per year */
							__(
								'Redirecting costs %(cost)s per year. Visitors will be automatically sent to your new address.'
							),
							{ cost: offsetRedirect?.cost_display }
						) }
					</Notice>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<DataForm< SiteRedirectFormData >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< SiteRedirectFormData > ) => {
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
									{ __( 'Redirect' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</form>
				</VStack>
			</CardBody>
		</Card>
	);
}
