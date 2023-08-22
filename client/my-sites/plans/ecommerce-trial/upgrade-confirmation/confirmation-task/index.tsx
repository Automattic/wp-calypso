import { Card } from '@automattic/components';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { GetActionUrlProps } from '../confirmation-tasks';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

interface ConfirmationTaskProps {
	id: string;
	context: string;
	title: TranslateResult;
	subtitle: TranslateResult;
	illustration: string;
	onCardClick?: () => void;
	getActionUrl?: ( actionUrlProps: GetActionUrlProps ) => string;
	taskActionUrlProps?: GetActionUrlProps;
}

const ConfirmationTask = ( props: ConfirmationTaskProps ) => {
	const {
		id,
		context,
		title,
		subtitle,
		illustration,
		onCardClick,
		getActionUrl,
		taskActionUrlProps,
	} = props;

	const dispatch = useDispatch();

	return (
		<Card
			className="confirmation-task__card"
			href={ taskActionUrlProps ? getActionUrl?.( taskActionUrlProps ) : null }
			onClick={ () => {
				onCardClick && onCardClick();
				dispatch(
					recordTracksEvent( `calypso_${ context }_upgraded_card_click`, { card_id: id } )
				);
			} }
		>
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
