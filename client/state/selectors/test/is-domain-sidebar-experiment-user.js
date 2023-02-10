import { isDomainSidebarExperimentUser } from '../is-domain-sidebar-experiment-user';

describe( 'isDomainSidebarExperimentUser', () => {
	test( 'should return false if the user is not in the experiment', () => {
		expect(
			isDomainSidebarExperimentUser( {
				currentUser: {
					user: { calypso_sidebar_upsell_experiment: null },
				},
				route: {
					query: {
						current: {
							domainAndPlanPackage: true,
						},
					},
				},
			} )
		).toBe( false );
	} );

	test( 'should return false if the user is in the experiment but the query param is not set', () => {
		expect(
			isDomainSidebarExperimentUser( {
				currentUser: {
					user: { calypso_sidebar_upsell_experiment: 'treatment' },
				},
				route: {
					query: {
						current: {},
					},
				},
			} )
		).toBe( false );
	} );

	test( 'should return true if the user is in the experiment and the query param is set', () => {
		expect(
			isDomainSidebarExperimentUser( {
				currentUser: {
					user: { calypso_sidebar_upsell_experiment: 'treatment' },
				},
				route: {
					query: {
						current: {
							domainAndPlanPackage: true,
						},
					},
				},
			} )
		).toBe( true );
	} );
} );
