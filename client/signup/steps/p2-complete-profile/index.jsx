import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import EditGravatar from 'calypso/blocks/edit-gravatar';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';

import './style.scss';

function P2CompleteProfile( { flowName, stepName, positionInFlow } ) {
	const translate = useTranslate();

	return (
		<P2StepWrapper
			flowName={ flowName }
			stepName={ stepName }
			positionInFlow={ positionInFlow }
			headerText={ translate( 'Complete your profile' ) }
			subHeaderText={ translate(
				'Using a recognizable photo and name will help your team to identify you more easily.'
			) }
		>
			<div className="p2-complete-profile">
				<div className="p2-complete-profile__avatar-wrapper">
					<EditGravatar />

					<button className="p2-complete-profile__upload-avatar-btn">
						{ translate( 'Upload a new avatar' ) }
					</button>
				</div>
			</div>
		</P2StepWrapper>
	);
}

P2CompleteProfile.propTypes = {
	flowName: PropTypes.string.isRequired,
	stepName: PropTypes.string.isRequired,
	positionInFlow: PropTypes.number.isRequired,
};

export default P2CompleteProfile;
