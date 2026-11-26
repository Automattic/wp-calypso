import { siteRestoreMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { getSiteDisplayUrl } from '../../utils/site-url';
import type { Site } from '@automattic/api-core';

interface SiteRestoreContentInfoProps {
	site: Site;
	onClose: () => void;
}

export default function SiteRestoreContentInfo( { site, onClose }: SiteRestoreContentInfoProps ) {
	const siteSlug = getSiteDisplayUrl( site );
	const mutation = useMutation(
		withSnackbar( siteRestoreMutation( site.ID ), {
			success: sprintf(
				/* translators: %s: site domain */
				__( '%s has been restored.' ),
				siteSlug
			),
			error: ( error: Error & { status?: number } ) =>
				error.status === 403
					? __( 'Only an administrator can restore a deleted site.' )
					: __( 'Failed to restore site' ),
		} )
	);

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		mutation.mutate( undefined, {
			onSuccess: () => {
				onClose();
			},
			onError: () => {
				onClose();
			},
		} );
	};

	return (
		<form onSubmit={ handleSubmit }>
			<VStack spacing={ 6 }>
				<Text as="p">
					{ createInterpolateElement(
						/* translators: %s: site domain */
						__( 'Are you sure to restore the site <siteDomain />?' ),
						{
							siteDomain: <strong>{ siteSlug }</strong>,
						}
					) }
				</Text>
				<ButtonStack justify="flex-end" expanded={ false }>
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary" type="submit" isBusy={ mutation.isPending }>
						{ __( 'Restore site' ) }
					</Button>
				</ButtonStack>
			</VStack>
		</form>
	);
}
