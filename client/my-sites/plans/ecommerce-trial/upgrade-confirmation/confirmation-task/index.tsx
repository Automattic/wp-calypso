import { Card } from '@automattic/components';

import './style.scss';

interface ConfirmationTaskProps {
	title: string;
	subtitle: string;
	illustration: string;
}

const ConfirmationTask = ( props: ConfirmationTaskProps ) => {
	const { title, subtitle } = props;

	return (
		<Card className="confirmation-task__card">
			<span>{ title }</span>
			<br />
			<span>{ subtitle }</span>
		</Card>
	);
};

export default ConfirmationTask;
