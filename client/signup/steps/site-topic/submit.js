/**
 * Internal dependencies
 */
import SignupActions from 'lib/signup/actions';
import { setSiteTopic } from 'state/signup/steps/site-topic/actions';

const submitSiteTopic = ( dispatch, siteTopic, stepName = 'site-topic' ) => {
	dispatch( setSiteTopic( siteTopic ) );
	SignupActions.submitSignupStep( { stepName }, [], { siteTopic } );
};

export default submitSiteTopic;
