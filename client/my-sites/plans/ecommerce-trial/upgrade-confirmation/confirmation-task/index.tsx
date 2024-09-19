import { Button, Card } from '@automattic/components';
import clsx from 'clsx';
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
	getActionUrl?: ( actionUrlProps: GetActionUrlProps ) => string;
	taskActionUrlProps?: GetActionUrlProps;
	buttonText?: string;
	onButtonClick?: () => void;
}

const ConfirmationTask = ( props: ConfirmationTaskProps ) => {
	const {
		id,
		context,
		title,
		subtitle,
		illustration,
		getActionUrl,
		taskActionUrlProps,
		buttonText,
		onButtonClick,
	} = props;

	const dispatch = useDispatch();

	return (
		<Card
			className={ clsx( 'confirmation-task__card', {
				'confirmation-task__card-with-cta': !! onButtonClick,
			} ) }
			href={ taskActionUrlProps ? getActionUrl?.( taskActionUrlProps ) : null }
			onClick={ () =>
				taskActionUrlProps &&
				dispatch( recordTracksEvent( `calypso_${ context }_upgraded_card_click`, { card_id: id } ) )
			}
		>
			<img
				className="confirmation-task__illustration"
				src={ illustration }
				alt={ title.toString() }
			/>
			<div className="confirmation-task__title">{ title }</div>
			<div className="confirmation-task__subtitle">{ subtitle }</div>
			{ buttonText && onButtonClick && (
				<div className="confirmation-task__action">
					<Button
						borderless
						primary
						onClick={ () => {
							dispatch(
								recordTracksEvent( `calypso_${ context }_upgraded_card_click`, { card_id: id } )
							);
							onButtonClick();
						} }
					>
						{ buttonText }
					</Button>
				</div>
			) }
		</Card>
	);
};

export default ConfirmationTask;
