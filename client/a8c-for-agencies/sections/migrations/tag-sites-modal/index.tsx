import {
	agencyMigrationCommissionSitesQuery,
	tagAgencySitesForCommissionMutation,
} from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Button,
	Modal,
	SelectControl,
	TextControl,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import { Icon, info } from '@wordpress/icons';
import { useState } from 'react';
import useMinimizeHelpCenterOnMount from 'calypso/a8c-for-agencies/hooks/use-minimize-help-center-on-mount';
import { preventWidows } from 'calypso/lib/formatting';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import MigrationsAddSitesTable from './add-sites-table';
import type { SiteItem } from '../hooks/use-fetch-all-managed-sites-for-commission';
import type { TaggedSite } from '../types';

import './style.scss';

export default function MigrationsTagSitesModal( {
	onClose,
	taggedSites,
	migrationTags,
}: {
	onClose: () => void;
	taggedSites?: TaggedSite[];
	migrationTags: string[];
} ) {
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const agencyId = useSelector( getActiveAgencyId );
	useMinimizeHelpCenterOnMount();

	const { mutate: tagSitesForMigration, isPending } = useMutation(
		tagAgencySitesForCommissionMutation( agencyId )
	);

	const [ selectedSites, setSelectedSites ] = useState< SiteItem[] | [] >( [] );
	const [ migrationSourceHost, setMigrationSourceHost ] = useState( '' );
	const [ otherHostingProvider, setOtherHostingProvider ] = useState( '' );

	const OTHER_OPTION_VALUE = 'other';

	const migrationSourceOptions = [
		{ label: __( 'Select a host' ), value: '' },
		{ label: __( 'WP Engine' ), value: 'wpengine' },
		{ label: __( 'Kinsta' ), value: 'kinsta' },
		{ label: __( 'Pantheon' ), value: 'pantheon' },
		{ label: __( 'Cloudways' ), value: 'cloudways' },
		{ label: __( 'SiteGround' ), value: 'siteground' },
		{ label: __( 'Bluehost' ), value: 'bluehost' },
		{ label: __( 'Liquid Web' ), value: 'liquidweb' },
		{ label: __( 'Other' ), value: OTHER_OPTION_VALUE },
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
					// Refresh the commission list so the newly tagged sites appear.
					queryClient.invalidateQueries( {
						queryKey: agencyMigrationCommissionSitesQuery( agencyId ).queryKey,
					} );
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
									createInterpolateElement(
										sprintf(
											/* translators: %s: the site URL */
											__(
												'The site <strong>%s</strong> has been successfully tagged for commission.'
											),
											siteUrl
										),
										{ strong: <strong /> }
									)
							  )
							: successNotice(
									sprintf(
										/* translators: %d: the number of sites tagged */
										__( '%d sites have been successfully tagged for commission.' ),
										selectedSites.length
									)
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
		<Modal
			className="migrations-tag-sites-modal"
			title={ __( 'Tag your transferred sites for commission.' ) }
			onRequestClose={ handleOnClose }
			size="large"
		>
			<VStack spacing={ 4 }>
				<Text>{ __( 'Select the sites you moved on your own.' ) }</Text>
				<div className="migrations-tag-sites-modal__instruction">
					<Icon size={ 18 } icon={ info } />
					{ preventWidows(
						__(
							"Can't find your transferred site? Ensure the Automattic for Agencies plugin is connected in WP-Admin to display the site here."
						)
					) }
				</div>
				<SelectControl
					__nextHasNoMarginBottom
					label={ __( 'Hosting provider' ) }
					value={ migrationSourceHost }
					options={ migrationSourceOptions }
					onChange={ handleMigrationSourceHostChange }
				/>
				{ isOtherSelected && (
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Other hosting provider' ) }
						value={ otherHostingProvider }
						onChange={ setOtherHostingProvider }
						placeholder={ __( 'Enter hosting provider name' ) }
					/>
				) }
				{ isValidHostingProvider && (
					<MigrationsAddSitesTable
						taggedSites={ taggedSites }
						selectedSites={ selectedSites }
						setSelectedSites={ setSelectedSites }
						migrationSourceHost={ selectedMigrationSourceHost }
					/>
				) }
			</VStack>
			<HStack className="migrations-tag-sites-modal__footer" justify="flex-end" spacing={ 3 }>
				<Button variant="tertiary" onClick={ handleOnClose }>
					{ __( 'Cancel' ) }
				</Button>
				<Button
					variant="primary"
					onClick={ handleAddSites }
					disabled={ isPending || ! isValidHostingProvider || selectedSites.length === 0 }
					isBusy={ isPending }
				>
					{ selectedSites.length > 0
						? sprintf(
								/* translators: %d: the number of sites selected */
								_n( 'Add %d site', 'Add %d sites', selectedSites.length ),
								selectedSites.length
						  )
						: __( 'Add sites' ) }
				</Button>
			</HStack>
		</Modal>
	);
}
