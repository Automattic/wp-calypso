import { Card } from '@automattic/components';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

interface ConfirmationTaskProps {
	title: TranslateResult;
	subtitle: TranslateResult;
	illustration: string;
}

const ConfirmationTask = ( props: ConfirmationTaskProps ) => {
	const { title, subtitle, illustration } = props;

	return (
		<Card className="confirmation-task__card">
			<img
				className="confirmation-task__illustration"
				src={ illustration }
				alt={ title.toString() }
			/>
			<div className="confirmation-task__title">{ title }</div>
			<div className="confirmation-task__subtitle">{ subtitle }</div>
		</Card>
	);
};

export default ConfirmationTask;
