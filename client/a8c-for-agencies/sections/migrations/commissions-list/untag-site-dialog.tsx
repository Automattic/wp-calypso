import {
	agencyMigrationCommissionSitesQuery,
	agencySiteTagsMutation,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import type { TaggedSite } from '../types';

export default function UntagSiteDialog( {
	site,
	migrationTags,
	onClose,
}: {
	site: TaggedSite;
	migrationTags: string[];
	onClose: () => void;
} ) {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );
	const { mutate, isPending } = useMutation( agencySiteTagsMutation( agencyId ) );

	const onConfirm = () => {
		const newTags = site.tags.reduce( ( acc, tag ) => {
			if ( migrationTags.includes( tag.name ) ) {
				return acc;
			}
			acc.push( tag.name );
			return acc;
		}, [] as string[] );

		mutate(
			{ siteId: site.id, tags: newTags },
			{
				onSuccess: () => {
					queryClient.invalidateQueries( {
						queryKey: agencyMigrationCommissionSitesQuery( agencyId ).queryKey,
					} );
					onClose();
					dispatch(
						successNotice(
							createInterpolateElement(
								sprintf(
									/* translators: %s: the site URL */
									__( 'Successfully untagged <strong>%s</strong>.' ),
									site.url
								),
								{ strong: <strong /> }
							),
							{ id: 'a4a-commission-list-untag-success', duration: 5000 }
						)
					);
				},
			}
		);
	};

	return (
		<A4AConfirmationDialog
			onClose={ onClose }
			onConfirm={ onConfirm }
			isLoading={ isPending }
			isDisabled={ isPending }
			title={ __( 'Untag site' ) }
		>
			{ createInterpolateElement(
				sprintf(
					/* translators: %s: the site name */
					__(
						'Are you sure you want to untag <b>%s</b>? This will stop it from being considered for a migration payout.'
					),
					site.url
				),
				{ b: <b /> }
			) }
		</A4AConfirmationDialog>
	);
}
