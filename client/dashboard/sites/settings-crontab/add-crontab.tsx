import { siteBySlugQuery, siteCrontabCreateMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __experimentalVStack as VStack, Button, TextControl } from '@wordpress/components';
import { DataForm, type Field } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import {
	siteRoute,
	siteSettingsCrontabAddRoute,
	siteSettingsCrontabRoute,
} from '../../app/router/sites';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import ScheduleField from './schedule-field';

interface AddCrontabFormData {
	schedule: string;
	command: string;
}

export default function AddCrontab() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const navigate = useNavigate( { from: siteSettingsCrontabAddRoute.fullPath } );

	const [ formData, setFormData ] = useState< AddCrontabFormData >( {
		schedule: 'hourly',
		command: '',
	} );

	const { mutate: createCrontab, isPending: isCreatingCrontab } = useMutation( {
		...siteCrontabCreateMutation( site.ID ),
		meta: {
			snackbar: {
				success: __( 'Scheduled job created.' ),
				error: __( 'Failed to create scheduled job.' ),
			},
		},
	} );

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

		createCrontab(
			{ schedule: formData.schedule, command: formData.command.trim() },
			{
				onSuccess: () => {
					navigate( {
						to: siteSettingsCrontabRoute.fullPath,
						params: { siteSlug },
					} );
				},
			}
		);
	};

	const isValidCommand = formData.command.trim().length > 0;

	const fields: Field< AddCrontabFormData >[] = useMemo(
		() => [
			{
				id: 'schedule',
				label: __( 'Schedule' ),
				type: 'text' as const,
				Edit: ( props ) => (
					<ScheduleField
						value={ props.field.getValue?.( { item: props.data } ) ?? 'hourly' }
						onChange={ ( newValue ) => props.onChange( { [ props.field.id ]: newValue } ) }
						disabled={ isCreatingCrontab }
					/>
				),
			},
			{
				id: 'command',
				label: __( 'Command' ),
				type: 'text' as const,
				description: __(
					'The command to execute (e.g., wp custom sync-products or bash custom-script.sh).'
				),
				Edit: ( props ) => (
					<TextControl
						__nextHasNoMarginBottom
						label={ props.field.label }
						help={ props.field.description }
						value={ props.field.getValue?.( { item: props.data } ) ?? '' }
						onChange={ ( newValue ) => props.onChange( { [ props.field.id ]: newValue } ) }
						disabled={ isCreatingCrontab }
					/>
				),
			},
		],
		[ isCreatingCrontab ]
	);

	const form = useMemo(
		() => ( {
			layout: { type: 'regular' as const },
			fields: [ 'schedule', 'command' ],
		} ),
		[]
	);

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'Add scheduled job' ) }
					description={ __(
						'Schedule a command to run automatically at specified intervals on your site.'
					) }
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
							<DataForm< AddCrontabFormData >
								data={ formData }
								fields={ fields }
								form={ form }
								onChange={ ( edits: Partial< AddCrontabFormData > ) => {
									setFormData( ( data ) => ( { ...data, ...edits } ) );
								} }
							/>
							<ButtonStack justify="flex-end">
								<Button variant="tertiary" onClick={ handleCancel } disabled={ isCreatingCrontab }>
									{ __( 'Cancel' ) }
								</Button>
								<Button
									variant="primary"
									type="submit"
									isBusy={ isCreatingCrontab }
									disabled={ isCreatingCrontab || ! isValidCommand }
									__next40pxDefaultSize
								>
									{ __( 'Add scheduled job' ) }
								</Button>
							</ButtonStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
