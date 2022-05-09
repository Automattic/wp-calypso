import './style.scss';

interface Props {
	flowLength: number;
	positionInFlow: number;
	translate: any;
}

const FlowProgress: React.FC< Props > = ( { flowLength, positionInFlow, translate } ) => {
	if ( flowLength > 1 ) {
		return (
			<div className="flow-progress">
				{ translate( 'Step %(stepNumber)d of %(stepTotal)d', {
					args: {
						stepNumber: positionInFlow + 1,
						stepTotal: flowLength,
					},
				} ) }
			</div>
		);
	}

	return null;
};

export default FlowProgress;
