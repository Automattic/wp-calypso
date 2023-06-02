import { Card } from '@automattic/components';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import type { GetActionUrlProps } from '../confirmation-tasks';
import type { TranslateResult } from 'i18n-calypso';

import './style.scss';

interface ConfirmationTaskProps {
	id: string;
	title: TranslateResult;
	subtitle: TranslateResult;
	illustration: string;
	getActionUrl: ( actionUrlProps: GetActionUrlProps ) => string;
	taskActionUrlProps: GetActionUrlProps;
}

const ConfirmationTask = ( props: ConfirmationTaskProps ) => {
	const { id, title, subtitle, illustration, getActionUrl, taskActionUrlProps } = props;

	const dispatch = useDispatch();

	return (
		<Card
			className="confirmation-task__card"
			href={ getActionUrl( taskActionUrlProps ) }
			onClick={ () =>
				dispatch(
					recordTracksEvent( 'calypso_wooexpress_trial_upgraded_card_click', { card_id: id } )
				)
			}
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
