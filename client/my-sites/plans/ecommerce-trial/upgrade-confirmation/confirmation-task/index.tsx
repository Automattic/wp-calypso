import { Card } from '@automattic/components';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

interface ConfirmationTaskProps {
	title: TranslateResult;
	subtitle: TranslateResult;
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
