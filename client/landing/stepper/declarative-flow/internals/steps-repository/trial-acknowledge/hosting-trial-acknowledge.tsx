import { HostingTrialAcknowledgement } from 'calypso/my-sites/plans/trials/trial-acknowledge/hosting-acknowledge';
import { Step } from '../../types';

export const HostingTrialAcknowledge: Step = ( { navigation } ) => {
	return <HostingTrialAcknowledgement onStartTrialClick={ () => navigation.submit?.() } />;
};
