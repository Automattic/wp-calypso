import {
	agencyMigrationCommissionSitesQuery,
	agencySiteTagsMutation,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
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
	const translate = useTranslate();
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
							translate( 'Successfully untagged {{strong}}%(siteUrl)s{{/strong}}.', {
								components: { strong: <strong /> },
								args: { siteUrl: site.url },
							} ),
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
			title={ translate( 'Untag site' ) }
		>
			{ translate(
				'Are you sure you want to untag {{b}}%(site)s{{/b}}? This will stop it from being considered for a migration payout.',
				{
					args: { site: site.url },
					components: {
						b: <b />,
					},
					comment: '%(site)s is the site name',
				}
			) }
		</A4AConfirmationDialog>
	);
}
