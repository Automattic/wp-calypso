import { Button } from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useUpdateTagsForSitesMutation from '../../../hooks/use-update-tags-for-sites';
import { A4A_MIGRATED_SITE_TAG } from '../lib/constants';
import MigrationsAddSitesTable, { SiteItem } from './add-sites-table';
import type { TaggedSite } from '../types';

import './style.scss';

export default function MigrationsTagSitesModal( {
	onClose,
	taggedSites,
	fetchMigratedSites,
}: {
	onClose: () => void;
	taggedSites?: TaggedSite[];
	fetchMigratedSites: () => void;
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { mutate: tagSitesForMigration, isPending } = useUpdateTagsForSitesMutation();

	const [ selectedSites, setSelectedSites ] = useState< SiteItem[] | [] >( [] );

	const handleAddSites = () => {
		tagSitesForMigration(
			{
				siteIds: selectedSites.map( ( site ) => site.id ),
				tags: [ A4A_MIGRATED_SITE_TAG ],
			},
			{
				onSuccess: () => {
					// Refetch the sites to update the UI
					fetchMigratedSites();
					dispatch(
						recordTracksEvent( 'calypso_a8c_migrations_tag_sites_modal_add_sites_success', {
							count: selectedSites.length,
						} )
					);
					const hasSingleSite = selectedSites.length === 1;
					const siteUrl = hasSingleSite ? selectedSites[ 0 ].site : '';
					dispatch(
						hasSingleSite
							? successNotice(
									translate(
										'The site {{strong}}%(siteUrl)s{{/strong}} has been successfully tagged for commission.',
										{
											components: { strong: <strong /> },
											args: { siteUrl },
										}
									)
							  )
							: successNotice(
									translate( '%(count)s sites have been successfully tagged for commission.', {
										args: { count: selectedSites.length },
										comment: '%(count)s is the number of sites tagged.',
									} )
							  )
					);
					onClose();
				},
				onError: ( error ) => {
					dispatch( errorNotice( error.message ) );
				},
			}
		);
		dispatch(
			recordTracksEvent( 'calypso_a8c_migrations_tag_sites_modal_add_sites_click', {
				count: selectedSites.length,
			} )
		);
	};

	const handleOnClose = () => {
		onClose();
		dispatch( recordTracksEvent( 'calypso_a8c_migrations_tag_sites_modal_close' ) );
	};

	return (
		<A4AModal
			onClose={ handleOnClose }
			extraActions={
				<Button
					variant="primary"
					onClick={ handleAddSites }
					disabled={ isPending }
					isBusy={ isPending }
				>
					{ selectedSites.length > 0
						? translate( 'Add %(count)d site', 'Add %(count)d sites', {
								args: {
									count: selectedSites.length,
								},
								count: selectedSites.length,
								comment: '%(count)s is the number of sites selected.',
						  } )
						: translate( 'Add sites' ) }
				</Button>
			}
			title={ translate( 'Tag your transferred sites for commission.' ) }
			subtile={ translate(
				"Select the sites you moved on your own. We'll check the migration and tag them as ready for your commission."
			) }
		>
			<div className="migrations-tag-sites-modal__instruction">
				<Icon size={ 18 } icon={ info } />
				{ preventWidows(
					translate(
						"Can't find your transferred site? Ensure the Automattic for Agencies plugin is connected in WP-Admin to display the site here."
					)
				) }
			</div>
			<MigrationsAddSitesTable
				taggedSites={ taggedSites }
				selectedSites={ selectedSites }
				setSelectedSites={ setSelectedSites }
			/>
		</A4AModal>
	);
}
