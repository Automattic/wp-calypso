import {
	queryClient,
	siteBackupsQuery,
	sitePendingWordPressVersionQuery,
	siteWordPressVersionQuery,
	siteWordPressVersionMutation,
	wpOrgCoreVersionQuery,
} from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from 'react';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { formatWordPressVersion } from '../../utils/wp-version';
import { useBackupState } from '../backups/use-backup-state';
import { VersionSwitchNotice } from './version-switch-notice';
import type { Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

interface VersionFormProps {
	site: Site;
	currentVersion: string | undefined;
}

export function VersionForm( { site, currentVersion }: VersionFormProps ) {
	const { data: latestVersion } = useQuery( wpOrgCoreVersionQuery() );
	const { data: betaVersion } = useQuery( wpOrgCoreVersionQuery( 'beta' ) );

	const backupState = useBackupState( site.ID );

	// Check if there's a pending version switch.
	const { data: pendingVersion } = useQuery( sitePendingWordPressVersionQuery( site.ID ) );
	const isSwitching = !! pendingVersion;
	const wasSwitchingRef = useRef( false );
	const [ isSwitched, setIsSwitched ] = useState( false );

	// Track the transition from switching to not switching.
	useEffect( () => {
		if ( wasSwitchingRef.current && ! isSwitching ) {
			setIsSwitched( true );
			queryClient.invalidateQueries( siteWordPressVersionQuery( site.ID ) );
		}
		wasSwitchingRef.current = isSwitching;
	}, [ isSwitching, site.ID ] );

	// Poll backups while a version switch is in progress.
	useQuery( {
		...siteBackupsQuery( site.ID ),
		refetchInterval: isSwitching ? 3000 : false,
		enabled: isSwitching,
	} );

	// After backup completes, poll pending version until it clears.
	useQuery( {
		...sitePendingWordPressVersionQuery( site.ID ),
		refetchInterval: isSwitching && backupState.hasRecentlyCompleted ? 5000 : false,
	} );

	const mutation = useMutation( {
		...siteWordPressVersionMutation( site.ID ),
		onSuccess: () => {
			backupState.setEnqueued( true );
			setIsSwitched( false );
			queryClient.invalidateQueries( sitePendingWordPressVersionQuery( site.ID ) );
		},
		meta: {
			snackbar: {
				error: __( 'Failed to save WordPress version.' ),
			},
		},
	} );

	const [ formData, setFormData ] = useState< { version: string } >( {
		version: currentVersion ?? '',
	} );

	const currentWpVersion = site.options?.software_version ?? '';

	const fields: Field< { version: string } >[] = [
		{
			id: 'version',
			label: __( 'WordPress version' ),
			Edit: 'select',
			elements: [
				{
					value: 'latest',
					label: formatWordPressVersion( latestVersion ?? currentWpVersion, 'latest', true ),
				},
				{
					value: 'beta',
					label: formatWordPressVersion( betaVersion ?? currentWpVersion, 'beta', true ),
				},
			],
		},
	];

	const form = {
		layout: { type: 'regular' as const },
		fields: [ 'version' ],
	};

	const isDirty = formData.version !== currentVersion;
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( formData.version );
	};

	return (
		<>
			{ ( isSwitching || isSwitched ) && (
				<VersionSwitchNotice
					backupState={ backupState }
					targetVersion={ pendingVersion ?? '' }
					isVersionSwitched={ isSwitched }
				/>
			) }
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<fieldset disabled={ isSwitching } style={ { border: 0, margin: 0, padding: 0 } }>
							<VStack spacing={ 4 }>
								<NavigationBlocker shouldBlock={ isDirty } />
								<DataForm< { version: string } >
									data={ formData }
									fields={ fields }
									form={ form }
									onChange={ ( edits: { version?: string } ) => {
										setFormData( ( data ) => ( { ...data, ...edits } ) );
									} }
								/>
								<ButtonStack justify="flex-start">
									<Button
										variant="primary"
										type="submit"
										isBusy={ isPending }
										disabled={ isPending || ! isDirty || isSwitching }
									>
										{ __( 'Save' ) }
									</Button>
								</ButtonStack>
							</VStack>
						</fieldset>
					</form>
				</CardBody>
			</Card>
		</>
	);
}
