import { siteCrontabCreateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import {
	TextControl,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import ScheduleField from './schedule-field';

interface AddCrontabFormProps {
	siteId: number;
	onSuccess: () => void;
	onCancel: () => void;
}

export function AddCrontabForm( { siteId, onSuccess, onCancel }: AddCrontabFormProps ) {
	const [ schedule, setSchedule ] = useState( 'hourly' );
	const [ command, setCommand ] = useState( '' );

	const { mutate: createCrontab, isPending: isCreatingCrontab } = useMutation( {
		...siteCrontabCreateMutation( siteId ),
		meta: {
			snackbar: {
				success: __( 'Scheduled job created.' ),
				error: __( 'Failed to create scheduled job.' ),
			},
		},
	} );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();

		if ( ! command.trim() ) {
			return;
		}

		createCrontab(
			{ schedule, command: command.trim() },
			{
				onSuccess: () => {
					setSchedule( 'hourly' );
					setCommand( '' );
					onSuccess();
				},
			}
		);
	};

	const isValid = command.trim().length > 0;

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 6 }>
						<SectionHeader
							title={ __( 'Add scheduled job' ) }
							description={ __(
								'Schedule a command to run automatically at specified intervals.'
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
							<Button variant="tertiary" onClick={ onCancel } disabled={ isCreatingCrontab }>
								{ __( 'Cancel' ) }
							</Button>
							<Button
								variant="primary"
								type="submit"
								isBusy={ isCreatingCrontab }
								disabled={ isCreatingCrontab || ! isValid }
								__next40pxDefaultSize
							>
								{ __( 'Add scheduled job' ) }
							</Button>
						</HStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}
