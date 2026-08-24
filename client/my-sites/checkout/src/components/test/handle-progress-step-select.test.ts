import { handleProgressStepSelect } from '../handle-progress-step-select';

const DOMAINS_URL = 'https://example.wordpress.com/setup/onboarding/domains';
const PLANS_URL = 'https://example.wordpress.com/setup/onboarding/plans';

describe( 'handleProgressStepSelect', () => {
	let clickStepBack: jest.Mock;
	let clickClose: jest.Mock;

	beforeEach( () => {
		clickStepBack = jest.fn();
		clickClose = jest.fn();
	} );

	it( 'steps back to the domains URL when the domains step is clicked', () => {
		handleProgressStepSelect( 'domains', {
			forceCheckoutBackUrlDomains: DOMAINS_URL,
			forceCheckoutBackUrl: PLANS_URL,
			clickStepBack,
			clickClose,
		} );

		expect( clickStepBack ).toHaveBeenCalledTimes( 1 );
		expect( clickStepBack ).toHaveBeenCalledWith( DOMAINS_URL );
		expect( clickClose ).not.toHaveBeenCalled();
	} );

	it( 'steps back to the plans URL when the plans step is clicked', () => {
		handleProgressStepSelect( 'plans', {
			forceCheckoutBackUrlDomains: DOMAINS_URL,
			forceCheckoutBackUrl: PLANS_URL,
			clickStepBack,
			clickClose,
		} );

		expect( clickStepBack ).toHaveBeenCalledTimes( 1 );
		expect( clickStepBack ).toHaveBeenCalledWith( PLANS_URL );
		expect( clickClose ).not.toHaveBeenCalled();
	} );

	it( 'falls back to close when the domains step has no valid back URL', () => {
		handleProgressStepSelect( 'domains', {
			forceCheckoutBackUrlDomains: undefined,
			forceCheckoutBackUrl: PLANS_URL,
			clickStepBack,
			clickClose,
		} );

		expect( clickClose ).toHaveBeenCalledTimes( 1 );
		expect( clickStepBack ).not.toHaveBeenCalled();
	} );

	it( 'falls back to close when the plans step has no valid back URL', () => {
		handleProgressStepSelect( 'plans', {
			forceCheckoutBackUrlDomains: DOMAINS_URL,
			forceCheckoutBackUrl: undefined,
			clickStepBack,
			clickClose,
		} );

		expect( clickClose ).toHaveBeenCalledTimes( 1 );
		expect( clickStepBack ).not.toHaveBeenCalled();
	} );
} );
