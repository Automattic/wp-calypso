import { DataForm } from '@automattic/dataviews';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	Card,
	CardBody,
	Button,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useState } from 'react';
import { siteQuery, siteStaticFile404Query, siteStaticFile404Mutation } from '../../app/queries';
import PageLayout from '../../components/page-layout';
import { canSetStaticFile404Handling } from '../../utils/site-features';
import SettingsCallout from '../settings-callout';
import SettingsPageHeader from '../settings-page-header';
import type { Field } from '@automattic/dataviews';

const fields: Field< { setting: string } >[] = [
	{
		id: 'setting',
		label: __( 'Server response' ),
		Edit: 'select',
		description: __(
			'Assets are images, fonts, JavaScript, and CSS files that web browsers request as part of loading a web page. This setting controls how the web server handles requests for missing asset files.'
		),
		elements: [
			{ value: 'default', label: __( 'Default' ) },
			{ value: 'lightweight', label: __( 'Send a lightweight File-Not-Found page' ) },
			{ value: 'wordpress', label: __( 'Delegate request to WordPress' ) },
		],
	},
];

const form = {
	type: 'regular' as const,
	fields: [ 'setting' ],
};

export default function SiteStaticFile404Settings( { siteSlug }: { siteSlug: string } ) {
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { data: site } = useQuery( siteQuery( siteSlug ) );
	const { data: currentSetting } = useQuery( {
		...siteStaticFile404Query( siteSlug ),
		enabled: site && canSetStaticFile404Handling( site ),
	} );
	const mutation = useMutation( siteStaticFile404Mutation( siteSlug ) );

	const [ formData, setFormData ] = useState< { setting: string } >( {
		setting: currentSetting ?? 'default',
	} );

	if ( ! site ) {
		return null;
	}

	if ( ! canSetStaticFile404Handling( site ) ) {
		return (
			<PageLayout
				size="small"
				header={ <SettingsPageHeader title={ __( 'Handling requests for nonexistent assets' ) } /> }
			>
				<SettingsCallout siteSlug={ siteSlug } />
			</PageLayout>
		);
	}

	const isDirty = formData.setting !== currentSetting;
	const { isPending } = mutation;

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		mutation.mutate( formData.setting, {
			onSuccess: () => {
				createSuccessNotice( __( 'Settings saved.' ), { type: 'snackbar' } );
			},
			onError: () => {
				createErrorNotice( __( 'Failed to save settings.' ), {
					type: 'snackbar',
				} );
			},
		} );
	};

	return (
		<PageLayout
			size="small"
			header={
				<SettingsPageHeader
					title={ __( 'Handling requests for nonexistent assets' ) }
					description={ __(
						'Choose how to handle requests for assets (like images, fonts, or JavaScript) that don’t exist on your site.'
					) }
				/>
			}
		>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 4 }>
							<DataForm< { setting: string } >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: { setting?: string } ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<HStack justify="flex-start">
								<Button
									variant="primary"
									type="submit"
									isBusy={ isPending }
									disabled={ isPending || ! isDirty }
								>
									{ __( 'Save' ) }
								</Button>
							</HStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
