import config from '@automattic/calypso-config';
import {
	Onboard,
	Site,
	User,
	AutomatedTransferEligibility,
	Plans,
	StepperInternal,
} from '@automattic/data-stores';

export const ONBOARD_STORE = Onboard.register();
export const STEPPER_INTERNAL_STORE = StepperInternal.register();

export const SITE_STORE = Site.register( {
	client_id: config( 'wpcom_signup_id' ),
	client_secret: config( 'wpcom_signup_key' ),
} );

export const USER_STORE = User.register();

export const AUTOMATED_ELIGIBILITY_STORE = AutomatedTransferEligibility.register();

export const PLANS_STORE = Plans.register();
