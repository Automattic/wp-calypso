import { siteCrontabCreateMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { TextControl, __experimentalVStack as VStack, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useCallback } from 'react';
import { ButtonStack } from '../../components/button-stack';
import { Card, CardBody } from '../../components/card';
import { SectionHeader } from '../../components/section-header';
import ScheduleField from './schedule-field';

interface AddCrontabFormProps {
	siteId: number;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export default function AddCrontabForm( { siteId, onSuccess, onCancel }: AddCrontabFormProps ) {
	const [ schedule, setSchedule ] = useState( 'hourly' );
	const [ command, setCommand ] = useState( '' );

	const mutation = useMutation( {
		...siteCrontabCreateMutation( siteId ),
		meta: {
			snackbar: {
				success: __( 'Scheduled job created.' ),
				error: __( 'Failed to create scheduled job.' ),
			},
		},
	} );

	const handleScheduleChange = useCallback( ( value: string ) => {
		setSchedule( value );
	}, [] );

	const handleSubmit = ( e: React.FormEvent ) => {
		e.preventDefault();
		if ( ! command.trim() ) {
			return;
		}
		mutation.mutate(
			{ schedule, command: command.trim() },
			{
				onSuccess: () => {
					setSchedule( 'hourly' );
					setCommand( '' );
					onSuccess?.();
				},
			}
		);
	};

	const isValid = command.trim().length > 0;
	const { isPending } = mutation;

	return (
		<Card>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<SectionHeader
							title={ __( 'Add scheduled job' ) }
							description={ __(
								'Schedule a command to run automatically at specified intervals.'
							) }
							level={ 3 }
						/>
						<ScheduleField
							value={ schedule }
							onChange={ handleScheduleChange }
							disabled={ isPending }
						/>
						<TextControl
							__nextHasNoMarginBottom
							label={ __( 'Command' ) }
							help={ __(
								'The command to execute (e.g., wp custom sync-products or bash custom-script.sh).'
							) }
							value={ command }
							onChange={ setCommand }
							disabled={ isPending }
						/>
						<ButtonStack justify="flex-start">
							<Button
								variant="primary"
								type="submit"
								isBusy={ isPending }
								disabled={ isPending || ! isValid }
							>
								{ __( 'Add scheduled job' ) }
							</Button>
							{ onCancel && (
								<Button variant="tertiary" onClick={ onCancel } disabled={ isPending }>
									{ __( 'Cancel' ) }
								</Button>
							) }
						</ButtonStack>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}
