import { updateSiteRedirectMutation, userPurchasesQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
	Card,
	CardBody,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { purchaseSettingsRoute } from '../../app/router/me';
import SiteRedirectForm, { SiteRedirectFormData } from './site-redirect-form';

interface ManageSiteRedirectProps {
	siteId: number;
	currentRedirect: string;
}

export default function ManageSiteRedirect( { siteId, currentRedirect }: ManageSiteRedirectProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { mutate: updateSiteRedirect, isPending } = useMutation(
		updateSiteRedirectMutation( siteId )
	);
	const { data: purchases } = useQuery( userPurchasesQuery() );
	const purchase = purchases?.find(
		( purchase ) => purchase.blog_id === siteId && purchase.product_slug === 'offsite_redirect'
	);

	const handleSubmit = ( formData: SiteRedirectFormData ) => {
		updateSiteRedirect( formData.redirect ?? '', {
			onSuccess: () => {
				createSuccessNotice( __( 'Site redirect updated successfully.' ), {
					type: 'snackbar',
				} );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to update site redirect.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<Card>
			<CardBody>
				<VStack spacing={ 4 }>
					<SiteRedirectForm
						initialValue={ currentRedirect }
						onSubmit={ handleSubmit }
						isSubmitting={ isPending }
						disableWhenUnchanged
					/>
					{ purchase && (
						<Text>
							{ createInterpolateElement( __( '<link>Manage</link> your site redirect upgrade.' ), {
								link: (
									<Link
										to={ purchaseSettingsRoute.fullPath }
										params={ { purchaseId: purchase.ID } }
									/>
								),
							} ) }
						</Text>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
