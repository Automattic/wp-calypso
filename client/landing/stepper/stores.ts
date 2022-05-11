import config from '@automattic/calypso-config';
import {
	Onboard,
	Site,
	ProductsList,
	User,
	AutomatedTransferEligibility,
} from '@automattic/data-stores';

export const ONBOARD_STORE = Onboard.register();

export const SITE_STORE = Site.register( {
	client_id: config( 'wpcom_signup_id' ),
	client_secret: config( 'wpcom_signup_key' ),
} );

export const PRODUCTS_LIST_STORE = ProductsList.register();

export const USER_STORE = User.register( {
	client_id: config( 'wpcom_signup_id' ),
	client_secret: config( 'wpcom_signup_key' ),
} );

export const AUTOMATED_ELIGIBILITY_STORE = AutomatedTransferEligibility.register();
