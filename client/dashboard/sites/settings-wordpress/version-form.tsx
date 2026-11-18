import {
	siteWordPressPrereleaseMutation,
	siteWordPressPrereleaseQuery,
	siteWordPressTrackVersionsQuery,
} from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { NavigationBlocker } from '../../app/navigation-blocker';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { formatWordPressVersion } from '../../utils/wp-version';
import type { VersionSwitchState } from './use-version-switch';
import type { Site } from '@automattic/api-core';
import type { Field } from '@wordpress/dataviews';

interface VersionFormProps {
	site: Site;
	currentVersion: string | undefined;
	versionSwitch: VersionSwitchState;
}

interface VersionFormData {
	version: string;
	optedOut: boolean;
}

export function VersionForm( { site, currentVersion, versionSwitch }: VersionFormProps ) {
	const { data: trackVersions } = useQuery( siteWordPressTrackVersionsQuery( site.ID ) );
	const latestVersion = trackVersions?.latest;
	const betaVersion = trackVersions?.beta;

	const { data: prerelease } = useQuery( siteWordPressPrereleaseQuery( site.ID ) );
	const prereleaseMutation = useMutation(
		withSnackbar( siteWordPressPrereleaseMutation( site.ID ), {
			success: __( 'Early access preference saved.' ),
			error: __( 'Failed to save early access preference.' ),
		} )
	);

	const { isSwitching, pendingVersion, switchVersion, isSaving } = versionSwitch;

	const [ formEdits, setFormEdits ] = useState< Partial< VersionFormData > >( {} );

	const formData: VersionFormData = {
		version: formEdits.version || pendingVersion || currentVersion || '',
		optedOut: formEdits.optedOut ?? prerelease?.opted_out ?? false,
	};

	const currentWpVersion = site.options?.software_version ?? '';

	const fields: Field< VersionFormData >[] = [
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
		{
			id: 'optedOut',
			label: __( 'Keep my site out of early access to new WordPress versions' ),
			description: __(
				'We sometimes give sites early access to an upcoming WordPress release before it’s final.'
			),
			Edit: 'checkbox',
		},
	];

	const canOptOut = prerelease?.auto_enrollable === true;

	const form = {
		layout: { type: 'regular' as const },
		fields: canOptOut ? [ 'version', 'optedOut' ] : [ 'version' ],
	};

	const isVersionDirty = formData.version !== currentVersion;
	const isOptedOutDirty = canOptOut && formData.optedOut !== prerelease?.opted_out;
	const isDirty = isVersionDirty || isOptedOutDirty;
	const isBusy = isSaving || isSwitching || prereleaseMutation.isPending;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( isVersionDirty ) {
			switchVersion( formData.version );
		}
		if ( isOptedOutDirty ) {
			prereleaseMutation.mutate( formData.optedOut );
		}
	};

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<fieldset disabled={ isSwitching } style={ { border: 0, margin: 0, padding: 0 } }>
						<VStack spacing={ 4 }>
							<NavigationBlocker shouldBlock={ isDirty } />
							<DataForm< VersionFormData >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< VersionFormData > ) => {
									setFormEdits( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isBusy }
									disabled={ isBusy || ! isDirty }
								>
									{ __( 'Save' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</fieldset>
				</form>
			</CardBody>
		</Card>
	);
}
