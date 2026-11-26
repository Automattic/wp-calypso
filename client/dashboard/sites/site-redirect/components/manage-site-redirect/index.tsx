import { updateSiteRedirectMutation, userPurchasesQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useAppContext } from '../../../../app/context';
import { purchaseSettingsRoute } from '../../../../app/router/me';
import { withSnackbar } from '../../../../app/snackbars/with-snackbar';
import { Card, CardBody } from '../../../../components/card';
import SiteRedirectForm, { SiteRedirectFormData } from '../site-redirect-form';

interface ManageSiteRedirectProps {
	siteId: number;
	currentRedirect: string;
}

export default function ManageSiteRedirect( { siteId, currentRedirect }: ManageSiteRedirectProps ) {
	const { supports } = useAppContext();
	const { mutate: updateSiteRedirect, isPending } = useMutation(
		withSnackbar( updateSiteRedirectMutation( siteId ), {
			success: __( 'Site redirect updated successfully.' ),
			error: __( 'Failed to update site redirect.' ),
		} )
	);
	const { data: purchases } = useQuery( userPurchasesQuery() );
	const purchase = purchases?.find(
		( purchase ) => purchase.blog_id === siteId && purchase.product_slug === 'offsite_redirect'
	);

	const handleSubmit = ( formData: SiteRedirectFormData ) => {
		updateSiteRedirect( formData.redirect ?? '' );
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
					{ purchase && !! ( supports.me && supports.me.billing ) && (
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
