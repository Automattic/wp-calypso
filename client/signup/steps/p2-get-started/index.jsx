import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, chevronRight } from '@wordpress/icons';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';

import './style.scss';

function P2GetStarted( { flowName, stepName, positionInFlow } ) {
	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerText={ __( 'Get started with P2' ) }
		>
			<div className="p2-get-started">
				<div className="p2-get-started__options">
					<div className="p2-get-started__option">
						<div className="p2-get-started__option-title">{ __( 'Create a new workspace' ) }</div>
						<div className="p2-get-started__option-description">
							{ __( "Start a new P2 and get your team on the same page — it's free!" ) }
						</div>
						<Button className="p2-get-started__button-next">
							<Icon className="p2-get-started__button-next-icon" icon={ chevronRight } />
						</Button>
					</div>
					<div className="p2-get-started__option">
						<div className="p2-get-started__option-title">
							{ __( 'Join an existing workspace' ) }
						</div>
						<div className="p2-get-started__option-description">
							{ __( 'Is your team already using P2? Sign up to join them.' ) }
						</div>
						<Button className="p2-get-started__button-next">
							<Icon className="p2-get-started__button-next-icon" icon={ chevronRight } />
						</Button>
					</div>
				</div>
			</div>
		</P2StepWrapper>
	);
}

export default P2GetStarted;
