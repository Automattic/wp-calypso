import {
	activeAgencyQuery,
	agencyMigrationCommissionSitesQuery,
	agencySiteTagsMutation,
} from '@automattic/api-queries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	__experimentalConfirmDialog as ConfirmDialog,
	__experimentalHeading as Heading,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import useMinimizeHelpCenterOnMount from 'calypso/a8c-for-agencies/hooks/use-minimize-help-center-on-mount';
import type { ShowSuccessNotice, TaggedSite } from '../types';

export default function UntagSiteDialog( {
	site,
	migrationTags,
	onClose,
	onSuccess,
}: {
	site: TaggedSite;
	migrationTags: string[];
	onClose: () => void;
	onSuccess: ShowSuccessNotice;
} ) {
	const queryClient = useQueryClient();
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id;
	useMinimizeHelpCenterOnMount();
	const { mutate, isPending } = useMutation( agencySiteTagsMutation( agencyId ) );

	const onConfirm = () => {
		// ConfirmDialog has no busy state on its confirm button, so guard against
		// a second submit while the first is still in flight.
		if ( isPending ) {
			return;
		}

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
					onSuccess(
						createInterpolateElement(
							sprintf(
								/* translators: %s: the site URL */
								__( 'Successfully untagged <strong>%s</strong>.' ),
								site.url
							),
							{ strong: <strong /> }
						),
						{ id: 'a4a-commission-list-untag-success', duration: 5000 }
					);
				},
			}
		);
	};

	return (
		<ConfirmDialog
			isOpen
			confirmButtonText={ __( 'Confirm' ) }
			onCancel={ onClose }
			onConfirm={ onConfirm }
		>
			<VStack spacing={ 3 }>
				<Heading level={ 2 } size={ 20 }>
					{ __( 'Untag site' ) }
				</Heading>
				<Text>
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
				</Text>
			</VStack>
		</ConfirmDialog>
	);
}
