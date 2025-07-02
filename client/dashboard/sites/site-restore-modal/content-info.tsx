import { useMutation } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { siteRestoreMutation } from '../../app/queries/site';
import { getSiteDisplayUrl } from '../../utils/site-url';
import type { Site } from '../../data/types';

interface ContentInfoProps {
	site: Site;
	onClose: () => void;
}

export default function SiteRestoreContentInfo( { site, onClose }: ContentInfoProps ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const mutation = useMutation( siteRestoreMutation( site.ID ) );
	const siteSlug = getSiteDisplayUrl( site );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		mutation.mutate( undefined, {
			onSuccess: () => {
				createSuccessNotice(
					/* translators: %s: site domain */
					sprintf( __( '%s has been restored.' ), siteSlug ),
					{ type: 'snackbar' }
				);

				onClose();
			},
			onError: ( error: Error & { status?: number } ) => {
				if ( error.status === 403 ) {
					createErrorNotice( __( 'Only an administrator can restore a deleted site.' ), {
						type: 'snackbar',
					} );
				} else {
					createErrorNotice( __( 'Failed to restore site' ), { type: 'snackbar' } );
				}

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
				<HStack spacing={ 4 } justify="flex-end" expanded={ false }>
					<Button variant="tertiary" onClick={ onClose }>
						{ __( 'Cancel' ) }
					</Button>
					<Button variant="primary" type="submit" isBusy={ mutation.isPending }>
						{ __( 'Restore site' ) }
					</Button>
				</HStack>
			</VStack>
		</form>
	);
}
