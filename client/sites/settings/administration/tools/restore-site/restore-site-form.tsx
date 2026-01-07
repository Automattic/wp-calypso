import { siteRestoreMutation } from '@automattic/api-queries';
import { SITE_EXCERPT_REQUEST_FIELDS, SITE_EXCERPT_REQUEST_OPTIONS } from '@automattic/sites';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';
import { ButtonStack } from 'calypso/dashboard/components/button-stack';
import { USE_SITE_EXCERPTS_QUERY_KEY } from 'calypso/data/sites/use-site-excerpts-query';
import { useDispatch, useSelector } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

interface ContentInfoProps {
	siteId: number;
	onClose: () => void;
}

export default function SiteRestoreContentInfo( { siteId, onClose }: ContentInfoProps ) {
	const dispatch = useDispatch();
	const siteDomain = useSelector( ( state: AppState ) => getSiteDomain( state, siteId ) || '' );
	const queryClient = useQueryClient();

	const mutation = useMutation( {
		...siteRestoreMutation( siteId ),
		onSuccess() {
			queryClient.invalidateQueries( {
				queryKey: [
					USE_SITE_EXCERPTS_QUERY_KEY,
					SITE_EXCERPT_REQUEST_FIELDS,
					SITE_EXCERPT_REQUEST_OPTIONS,
					[],
					'all',
				],
			} );
			queryClient.invalidateQueries( {
				queryKey: [
					USE_SITE_EXCERPTS_QUERY_KEY,
					SITE_EXCERPT_REQUEST_FIELDS,
					SITE_EXCERPT_REQUEST_OPTIONS,
					[],
					'deleted',
				],
			} );
		},
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		mutation.mutate( undefined, {
			onSuccess: () => {
				dispatch(
					successNotice(
						/* translators: %s: site domain */ sprintf( __( '%s has been restored.' ), siteDomain ),
						{ duration: 3000 }
					)
				);

				onClose();
			},
			onError: ( error: Error & { status?: number } ) => {
				if ( error.status === 403 ) {
					dispatch(
						errorNotice( __( 'Only an administrator can restore a deleted site.' ), {
							duration: 5000,
						} )
					);
				} else {
					dispatch( errorNotice( __( 'Failed to restore site' ), { duration: 5000 } ) );
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
							siteDomain: <strong>{ siteDomain }</strong>,
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
