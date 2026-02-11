import {
	Button,
	SelectControl,
	TextControl,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { Icon, info } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import A4AModal from 'calypso/a8c-for-agencies/components/a4a-modal';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import useTagSitesForCommissionMutation from '../../../hooks/use-tag-sites-for-commission';
import MigrationsAddSitesTable from './add-sites-table';
import type { SiteItem } from '../hooks/use-fetch-all-managed-sites-for-commission';
import type { TaggedSite } from '../types';

import './style.scss';

export default function MigrationsTagSitesModal( {
	onClose,
	taggedSites,
	fetchMigratedSites,
	migrationTags,
}: {
	onClose: () => void;
	taggedSites?: TaggedSite[];
	fetchMigratedSites: () => void;
	migrationTags: string[];
} ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { mutate: tagSitesForMigration, isPending } = useTagSitesForCommissionMutation();

	const [ selectedSites, setSelectedSites ] = useState< SiteItem[] | [] >( [] );
	const [ migrationSourceHost, setMigrationSourceHost ] = useState( '' );
	const [ otherHostingProvider, setOtherHostingProvider ] = useState( '' );

	const OTHER_OPTION_VALUE = 'other';

	const migrationSourceOptions = [
		{ label: translate( 'Select a host' ), value: '' },
		{ label: translate( 'WP Engine' ), value: 'wpengine' },
		{ label: translate( 'Kinsta' ), value: 'kinsta' },
		{ label: translate( 'Pantheon' ), value: 'pantheon' },
		{ label: translate( 'Cloudways' ), value: 'cloudways' },
		{ label: translate( 'SiteGround' ), value: 'siteground' },
		{ label: translate( 'Bluehost' ), value: 'bluehost' },
		{ label: translate( 'Liquid Web' ), value: 'liquidweb' },
		{ label: translate( 'Other' ), value: OTHER_OPTION_VALUE },
	];

	const isOtherSelected = migrationSourceHost === OTHER_OPTION_VALUE;
	const finalMigrationSourceHost = isOtherSelected ? otherHostingProvider : migrationSourceHost;
	const isValidHostingProvider = isOtherSelected
		? otherHostingProvider.trim().length > 0
		: migrationSourceHost.length > 0;

	const handleAddSites = () => {
		tagSitesForMigration(
			{
				siteIds: selectedSites.map( ( site ) => site.id ),
				tags: migrationTags,
				migrationSourceHost: finalMigrationSourceHost,
			},
			{
				onSuccess: () => {
					// Refetch the sites to update the UI
					fetchMigratedSites();
					dispatch(
						recordTracksEvent( 'calypso_a8c_migrations_tag_sites_modal_add_sites_success', {
							count: selectedSites.length,
							migration_source_host: finalMigrationSourceHost,
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
				migration_source_host: finalMigrationSourceHost,
			} )
		);
	};

	const handleOnClose = () => {
		onClose();
		dispatch( recordTracksEvent( 'calypso_a8c_migrations_tag_sites_modal_close' ) );
	};

	const handleMigrationSourceHostChange = ( value: string ) => {
		setMigrationSourceHost( value );
		if ( value !== OTHER_OPTION_VALUE ) {
			setOtherHostingProvider( '' );
		}
	};

	const selectedMigrationSourceHost = isOtherSelected
		? otherHostingProvider
		: migrationSourceOptions.find( ( option ) => option.value === migrationSourceHost )?.label ??
		  '';

	return (
		<A4AModal
			onClose={ handleOnClose }
			extraActions={
				<Button
					variant="primary"
					onClick={ handleAddSites }
					disabled={ isPending || ! isValidHostingProvider || selectedSites.length === 0 }
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
			<Spacer marginBottom={ 4 } />
			<SelectControl
				label={ translate( 'Hosting provider' ) }
				value={ migrationSourceHost }
				options={ migrationSourceOptions }
				onChange={ handleMigrationSourceHostChange }
			/>
			{ isOtherSelected && (
				<>
					<Spacer marginBottom={ 4 } />
					<TextControl
						label={ translate( 'Other hosting provider' ) }
						value={ otherHostingProvider }
						onChange={ setOtherHostingProvider }
						placeholder={ translate( 'Enter hosting provider name' ) }
					/>
				</>
			) }
			{ isValidHostingProvider && (
				<MigrationsAddSitesTable
					taggedSites={ taggedSites }
					selectedSites={ selectedSites }
					setSelectedSites={ setSelectedSites }
					migrationSourceHost={ selectedMigrationSourceHost }
				/>
			) }
		</A4AModal>
	);
}
