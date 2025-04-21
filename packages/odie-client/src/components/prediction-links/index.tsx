import type { MessagePrediction } from '../../types';
import './styles.scss';

type PredictionLinksProps = {
	predictions: MessagePrediction;
	onPredictionClick: ( prediction: string, predictionKey: string ) => void;
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

	const predictionKeys = [ 'best_reply_key', 'best_second_reply_key', 'best_third_reply_key' ];

	return (
		<div className={ `odie-prediction-links ${ className }` }>
			<p className="odie-prediction-links__title">SUGGESTED FOLLOW UPS</p>
			{ predictionContent.map( ( prediction, index ) => (
				<button
					key={ index }
					className="odie-prediction-link"
					onClick={ () => onPredictionClick( prediction, predictionKeys[ index ] ) }
				>
					{ prediction }
				</button>
			) ) }
		</div>
	);
};
