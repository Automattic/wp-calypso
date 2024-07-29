import { EntrepreneurTrialAcknowledgement } from 'calypso/my-sites/plans/trials/trial-acknowledge/entrepreneur-acknowledge';
import { Step } from '../../types';

export const EntrepreneurTrialAcknowledge: Step = ( { navigation } ) => {
	return <EntrepreneurTrialAcknowledgement onStartTrialClick={ () => navigation.submit?.() } />;
};
