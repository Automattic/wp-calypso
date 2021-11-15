import { useTranslate } from 'i18n-calypso';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';

import './style.scss';

function P2GetStarted( { flowName, stepName, positionInFlow } ) {
	const translate = useTranslate();

	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerText={ translate( 'Get started with P2' ) }
		>
			<div className="p2-get-started">
				<span role="img" aria-label="emoji">
					🚧
				</span>{ ' ' }
				I am under construction!
			</div>
		</P2StepWrapper>
	);
}

export default P2GetStarted;
