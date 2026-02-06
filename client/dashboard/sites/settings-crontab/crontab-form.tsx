import {
	siteBySlugQuery,
	siteCrontabCreateMutation,
	siteCrontabUpdateMutation,
} from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, TextControl } from '@wordpress/components';
import { DataForm, type Field } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import {
	siteRoute,
	siteSettingsCrontabAddRoute,
	siteSettingsCrontabEditRoute,
	siteSettingsCrontabRoute,
} from '../../app/router/sites';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import { parseScheduleValue, ScheduleField } from './schedule-field';
import type { Crontab, CrontabFormData } from '@automattic/api-core';

interface CrontabFormProps {
	crontab?: Crontab;
}

export default function CrontabForm( { crontab }: CrontabFormProps ) {
	const isEditMode = !! crontab;
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const navigate = useNavigate( {
		from: isEditMode ? siteSettingsCrontabEditRoute.fullPath : siteSettingsCrontabAddRoute.fullPath,
	} );

	// Initialize form data once from the loaded crontab (edit mode) or defaults (add mode)
	const [ formData, setFormData ] = useState< CrontabFormData >( () => {
		if ( crontab ) {
			return {
				schedule: parseScheduleValue( crontab.schedule ),
				command: crontab.command,
			};
		}
		return {
			schedule: 'hourly',
			command: '',
		};
	} );

	const { mutate: createCrontab, isPending: isCreating } = useMutation( {
		...siteCrontabCreateMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Scheduled job created.' ),
				error: __( 'Failed to create scheduled job.' ),
			},
		},
	} );

	const { mutate: updateCrontab, isPending: isUpdating } = useMutation( {
		...siteCrontabUpdateMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Scheduled job updated.' ),
				error: __( 'Failed to update scheduled job.' ),
			},
		},
	} );

	const isPending = isEditMode ? isUpdating : isCreating;

	const handleCancel = () => {
		navigate( {
			to: siteSettingsCrontabRoute.fullPath,
			params: { siteSlug },
		} );
	};

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( ! formData.command.trim() ) {
			return;
		}

		const onSuccess = () => {
			navigate( {
				to: siteSettingsCrontabRoute.fullPath,
				params: { siteSlug },
			} );
		};

		if ( isEditMode && crontab ) {
			updateCrontab(
				{
					cronId: crontab.cron_id,
					params: { schedule: formData.schedule, command: formData.command.trim() },
				},
				{ onSuccess }
			);
		} else {
			createCrontab(
				{ schedule: formData.schedule, command: formData.command.trim() },
				{ onSuccess }
			);
		}
	};

	const isValidCommand = formData.command.trim().length > 0;

	const fields: Field< CrontabFormData >[] = useMemo(
		() => [
			{
				id: 'schedule',
				label: __( 'Schedule' ),
				type: 'text' as const,
				Edit: ( props ) => (
					<ScheduleField
						value={ props.data.schedule }
						onChange={ ( newValue ) => props.onChange( { [ props.field.id ]: newValue } ) }
						disabled={ isPending }
					/>
				),
			},
			{
				id: 'command',
				label: __( 'Command' ),
				type: 'text' as const,
				Edit: ( props ) => (
					<TextControl
						label={ props.field.label }
						help={ createInterpolateElement(
							__(
								'WP-CLI command (e.g., <code>wp custom sync-products</code>) or shell command (e.g., <code>bash custom-script.sh</code>) to be executed. Output redirection is also supported (e.g., <code>> /dev/null 2>&1</code>).'
							),
							{
								code: <code />,
							}
						) }
						value={ props.data.command }
						onChange={ ( newValue ) => props.onChange( { [ props.field.id ]: newValue } ) }
						disabled={ isPending }
					/>
				),
			},
		],
		[ isPending ]
	);

	const form = useMemo(
		() => ( {
			layout: { type: 'regular' as const },
			fields: [ 'schedule', 'command' ],
		} ),
		[]
	);

	const pageTitle = isEditMode ? __( 'Edit scheduled job' ) : __( 'Add scheduled job' );
	const pageDescription = isEditMode
		? __( 'Update the schedule or command for this job.' )
		: __( 'Schedule a command to run automatically at specified intervals on your site.' );
	const submitButtonLabel = isEditMode ? __( 'Save changes' ) : __( 'Add scheduled job' );

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ pageTitle }
					description={ pageDescription }
				/>
			}
		>
			<Card>
				<CardBody>
					<form onSubmit={ handleSubmit }>
						<VStack spacing={ 6 }>
							<SectionHeader
								title={ __( 'Configure schedule and command' ) }
								description={ __(
									'Choose a command to run and specify how often it should be executed.'
								) }
								level={ 3 }
							/>
							<DataForm< CrontabFormData >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< CrontabFormData > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<ButtonStack justify="flex-end">
								<Button variant="tertiary" onClick={ handleCancel } disabled={ isPending }>
									{ __( 'Cancel' ) }
								</Button>
								<Button
									variant="primary"
									type="submit"
									isBusy={ isPending }
									disabled={ isPending || ! isValidCommand }
									__next40pxDefaultSize
								>
									{ submitButtonLabel }
								</Button>
							</ButtonStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
