import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import './style.scss';

const FlowProgressIndicator = ( { flowLength, positionInFlow, translate, flowName } ) => {
	if ( flowLength > 1 ) {
		const flowClassName = clsx(
			'flow-progress-indicator',
			`flow-progress-indicator__${ flowName }`
		);

		return (
			<div className={ flowClassName }>
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

export default localize( FlowProgressIndicator );
