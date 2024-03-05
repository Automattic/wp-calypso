import { useMutationState } from '@tanstack/react-query';
import {
	__experimentalText as Text,
	Button,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
} from '@wordpress/components';
import { arrowLeft } from '@wordpress/icons';
import { ScheduleForm } from './schedule-form';

interface Props {
	onNavBack?: () => void;
}
export const ScheduleCreate = ( props: Props ) => {
	const { onNavBack } = props;

	const mutationState = useMutationState( {
		filters: { mutationKey: [ 'create-schedule-updates', siteSlug ] },
	} );

	return (
		<Card className="plugins-update-manager">
			<CardHeader size="extraSmall">
				<div className="ch-placeholder">
					{ onNavBack && (
						<Button icon={ arrowLeft } onClick={ onNavBack }>
							Back
						</Button>
					) }
				</div>
				<Text>New Schedule</Text>
				<div className="ch-placeholder"></div>
			</CardHeader>
			<CardBody>
				<ScheduleForm onSyncSuccess={ () => onNavBack && onNavBack() } />
			</CardBody>
			<CardFooter>
				<Button form="schedule" type="submit" variant="primary" isBusy={ !! mutationState.length }>
					Create
				</Button>
			</CardFooter>
		</Card>
	);
};
