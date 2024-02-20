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

import './styles.scss';

export const Create = () => {
	return (
		<Card className="plugins-update-manager">
			<CardHeader size="extraSmall">
				<Button icon={ arrowLeft }>Back</Button>
				<Text>New Schedule</Text>
				<div className="placeholder"></div>
			</CardHeader>
			<CardBody>
				<ScheduleForm />
			</CardBody>
			<CardFooter>
				<Button variant="primary">Create</Button>
			</CardFooter>
		</Card>
	);
};
