import { productsQuery, domainCanRedirectQuery } from '@automattic/api-queries';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { addQueryArgs } from '@wordpress/url';
import { Card, CardBody } from '../../components/card';
import { Notice } from '../../components/notice';
import { redirectToDashboardLink, wpcomLink } from '../../utils/link';
import SiteRedirectForm, { SiteRedirectFormData } from './site-redirect-form';

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
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const [ currentRedirectValue, setCurrentRedirectValue ] = useState( '' );
	const { refetch } = useQuery( {
		...domainCanRedirectQuery( siteId, currentRedirectValue ),
		enabled: false,
	} );

	if ( ! offsetRedirect ) {
		return null;
	}

	const handleFormDataChange = ( formData: SiteRedirectFormData ) => {
		setCurrentRedirectValue( formData.redirect );
	};

	const handleSubmit = async ( formData: SiteRedirectFormData ) => {
		setIsSubmitting( true );

		const backUrl = redirectToDashboardLink( { supportBackport: true } );
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
		window.location.href = addQueryArgs( wpcomLink( `/checkout/${ siteSlug }` ), {
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
					<SiteRedirectForm
						onSubmit={ handleSubmit }
						isSubmitting={ isSubmitting }
						submitButtonText={ __( 'Redirect' ) }
						onFormDataChange={ handleFormDataChange }
					/>
				</VStack>
			</CardBody>
		</Card>
	);
}
