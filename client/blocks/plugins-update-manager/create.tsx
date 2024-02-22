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

interface Props {
	onNavBack?: () => void;
}
export const Create = ( props: Props ) => {
	const { onNavBack } = props;

	return (
		<Card className="plugins-update-manager">
			<CardHeader size="extraSmall">
				{ onNavBack && (
					<Button icon={ arrowLeft } onClick={ onNavBack }>
						Back
					</Button>
				) }
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
