import { countDomainsInOrangeStatus } from '../utils';

describe( 'countDomainsInOrangeStatus function', () => {
	const domains = [
		{ statusClass: 'status-neutral-dot' },
		{ statusClass: 'status-neutral-dot' },
		{ statusClass: 'status-error' },
		{ statusClass: 'status-warning' },
		{ statusClass: 'status-warning' },
		{ statusClass: 'status-warning' },
		{ statusClass: 'status-success' },
		{ statusClass: 'status-success' },
		{ statusClass: 'status-success' },
		{ statusClass: 'status-success' },
		{ statusClass: 'status-success' },
		{ statusClass: 'status-premium' },
	];

	test( 'It should return the number of domains that have set one of the following values for the statusClass property: "status-neutral-dot", "status-alert", "status-warning", "status-error"', () => {
		expect( countDomainsInOrangeStatus( domains ) ).toBe( 6 );
	} );
} );
