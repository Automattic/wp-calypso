import {
	queryClient,
	siteBackupsQuery,
	siteBySlugQuery,
	siteWordPressVersionQuery,
	siteWordPressVersionMutation,
	wpOrgCoreVersionQuery,
} from '@automattic/api-queries';
import { useQuery, useSuspenseQuery, useMutation } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import InlineSupportLink from '../../components/inline-support-link';
import Notice from '../../components/notice';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { formatWordPressVersion, getFormattedWordPressVersion } from '../../utils/wp-version';
import { useBackupState } from '../backups/use-backup-state';
import { canViewWordPressSettings } from '../features';
import { VersionSwitchNotice } from './version-switch-notice';
import type { Field } from '@wordpress/dataviews';

export default function WordPressSettings( { siteSlug }: { siteSlug: string } ) {
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const canView = canViewWordPressSettings( site );

	const { data: currentVersion } = useQuery( {
		...siteWordPressVersionQuery( site.ID ),
		enabled: canView,
	} );

	const { data: latestVersion } = useQuery( {
		...wpOrgCoreVersionQuery(),
		enabled: canView,
	} );
	const { data: betaVersion } = useQuery( {
		...wpOrgCoreVersionQuery( 'beta' ),
		enabled: canView,
	} );

	const backupState = useBackupState( site.ID );
	const [ switchTarget, setSwitchTarget ] = useState< string | null >( null );

	// The version has changed when the current version matches what we requested.
	const isVersionChanged = !! switchTarget && currentVersion === switchTarget;
	const isSwitching = !! switchTarget && ! isVersionChanged;

	// Poll backups while a version switch is in progress.
	useQuery( {
		...siteBackupsQuery( site.ID ),
		refetchInterval: isSwitching ? 3000 : false,
		enabled: canView && isSwitching,
	} );

	// After backup completes, poll WP version until it changes.
	useQuery( {
		...siteWordPressVersionQuery( site.ID ),
		refetchInterval: isSwitching && backupState.hasRecentlyCompleted ? 5000 : false,
		enabled: canView,
	} );

	// After backup completes, also invalidate immediately to get a quick first check.
	useEffect( () => {
		if ( backupState.hasRecentlyCompleted ) {
			queryClient.invalidateQueries( siteWordPressVersionQuery( site.ID ) );
		}
	}, [ backupState.hasRecentlyCompleted, site.ID ] );

	const mutation = useMutation( {
		...siteWordPressVersionMutation( site.ID ),
		onSuccess: () => {
			backupState.setEnqueued( true );
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
		setSwitchTarget( formData.version );
		mutation.mutate( formData.version );
	};

	if ( ! canView ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						prefix={ <Breadcrumbs length={ 2 } /> }
						title="WordPress"
						description={ __( 'Manage your WordPress version.' ) }
					/>
				}
			>
				<Notice>
					<VStack>
						<Text as="p">
							{ sprintf(
								// translators: %s: WordPress version, e.g. 6.8
								__( 'Every WordPress.com site runs the latest WordPress version (%s).' ),
								getFormattedWordPressVersion( site )
							) }
						</Text>
						{ site.is_wpcom_atomic && (
							<Text as="p">
								{ createInterpolateElement(
									__(
										'Switch to a staging site to test a beta version of the next WordPress release. <learnMoreLink />'
									),
									{
										learnMoreLink: <InlineSupportLink supportContext="switch-to-staging-site" />,
									}
								) }
							</Text>
						) }
					</VStack>
				</Notice>
			</PageLayout>
		);
	}

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 2 } /> }
					title="WordPress"
					description={ __( 'Manage your WordPress version.' ) }
				/>
			}
			notices={
				isSwitching || isVersionChanged ? (
					<VersionSwitchNotice
						backupState={ backupState }
						targetVersion={
							switchTarget === 'beta'
								? betaVersion ?? currentWpVersion
								: latestVersion ?? currentWpVersion
						}
						isVersionChanged={ isVersionChanged }
					/>
				) : undefined
			}
		>
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
		</PageLayout>
	);
}
