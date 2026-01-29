import { siteBySlugQuery, siteCrontabCreateMutation } from '@automattic/api-queries';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	TextControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import {
	siteRoute,
	siteSettingsCrontabAddRoute,
	siteSettingsCrontabRoute,
} from '../../app/router/sites';
import { Card, CardBody } from '../../components/card';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { SectionHeader } from '../../components/section-header';
import ScheduleField from './schedule-field';

export default function AddCrontab() {
	const { siteSlug } = siteRoute.useParams();
	const { data: site } = useSuspenseQuery( siteBySlugQuery( siteSlug ) );
	const navigate = useNavigate( { from: siteSettingsCrontabAddRoute.fullPath } );

	const [ schedule, setSchedule ] = useState( 'hourly' );
	const [ command, setCommand ] = useState( '' );

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

		if ( ! command.trim() ) {
			return;
		}

		createCrontab(
			{ schedule, command: command.trim() },
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

	const isValidCommand = command.trim().length > 0;

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 3 } /> }
					title={ __( 'Add Scheduled Job' ) }
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
									'Choose when the command should run and specify the exact command to execute.'
								) }
								level={ 3 }
							/>
							<ScheduleField
								value={ schedule }
								onChange={ setSchedule }
								disabled={ isCreatingCrontab }
							/>
							<TextControl
								__nextHasNoMarginBottom
								label={ __( 'Command' ) }
								help={ __(
									'The command to execute (e.g., wp custom sync-products or bash custom-script.sh).'
								) }
								value={ command }
								onChange={ setCommand }
								disabled={ isCreatingCrontab }
							/>
							<HStack justify="flex-end">
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
							</HStack>
						</VStack>
					</form>
				</CardBody>
			</Card>
		</PageLayout>
	);
}
