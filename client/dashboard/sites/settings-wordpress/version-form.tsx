import { wpOrgCoreVersionQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { NavigationBlocker } from '../../app/navigation-blocker';
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

export function VersionForm( { site, currentVersion, versionSwitch }: VersionFormProps ) {
	const { data: latestVersion } = useQuery( wpOrgCoreVersionQuery() );
	const { data: betaVersion } = useQuery( wpOrgCoreVersionQuery( 'beta' ) );

	const { isSwitching, pendingVersion, switchVersion, isSaving } = versionSwitch;

	const [ formEdits, setFormEdits ] = useState< { version: string } >( {
		version: '',
	} );

	const formData = {
		version: formEdits.version || pendingVersion || currentVersion || '',
	};

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

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		switchVersion( formData.version );
	};

	return (
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
									setFormEdits( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<ButtonStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isSaving || isSwitching }
									disabled={ isSaving || ! isDirty || isSwitching }
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
