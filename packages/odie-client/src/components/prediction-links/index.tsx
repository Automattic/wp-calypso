import { __ } from '@wordpress/i18n';
import type { MessagePrediction } from '../../types';

type PredictionLinksProps = {
	predictions: MessagePrediction;
	onPredictionClick: ( prediction: string ) => void;
	className?: string;
};

export const PredictionLinks = ( {
	predictions,
	onPredictionClick,
	className = '',
}: PredictionLinksProps ) => {
	const predictionContent = [
		predictions.best_reply,
		predictions.best_second_reply,
		predictions.best_third_reply,
	];

	return (
		<div className={ `odie-prediction-links ${ className }` }>
			{ predictionContent.map( ( prediction, index ) => (
				<button
					key={ index }
					className="odie-prediction-link"
					onClick={ () => onPredictionClick( prediction ) }
				>
					{ prediction }
				</button>
			) ) }

			<button
				className="odie-prediction-link odie-prediction-link__type-reply"
				onClick={ () => onPredictionClick( 'custom-reply' ) }
			>
				{ __( 'Type your reply', __i18n_text_domain__ ) }
			</button>
		</div>
	);
};
