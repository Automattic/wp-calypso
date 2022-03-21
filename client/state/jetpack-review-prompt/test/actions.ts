import { expect } from 'chai';
import { combineDismissPreference, combineValidPreference } from '../actions';

describe( 'actions', () => {
	describe( 'Scan Review Prompt:', () => {
		describe( 'combineDismissPreference()', () => {
			test( 'should set dismissedAt', () => {
				const dismissDate = Date.now();

				expect(
					combineDismissPreference(
						{
							preferences: {},
						},
						'scan',
						dismissDate,
						false
					).scan
				).to.have.property( 'dismissedAt', dismissDate );
			} );

			test( 'should set dismissCount to 1 on initial dismiss', () => {
				expect(
					combineDismissPreference(
						{
							preferences: {},
						},
						'scan',
						Date.now(),
						false
					).scan
				).to.have.property( 'dismissCount', 1 );
			} );

			test( 'should increment dismissCount', () => {
				expect(
					combineDismissPreference(
						{
							preferences: {
								localValues: {
									'jetpack-review-prompt': {
										scan: {
											dismissCount: 1,
											dismissedAt: Date.now(),
											validFrom: null,
											reviewed: false,
										},
									},
								},
							},
						},
						'scan',
						Date.now(),
						false
					).scan
				).to.have.property( 'dismissCount', 2 );
			} );

			test( 'should set reviewed', () => {
				expect(
					combineDismissPreference(
						{
							preferences: {},
						},
						'scan',
						Date.now(),
						true
					).scan
				).to.have.property( 'reviewed', true );
			} );

			describe( 'combineValidPreference()', () => {
				test( 'should set validFrom', () => {
					const validFrom = Date.now();

					expect(
						combineValidPreference(
							{
								preferences: {},
							},
							'scan',
							validFrom
						).scan
					).to.have.property( 'validFrom', validFrom );
				} );
			} );
		} );
	} );
	describe( 'Restore Review Prompt:', () => {
		describe( 'combineDismissPreference()', () => {
			test( 'should set dismissedAt', () => {
				const dismissDate = Date.now();

				expect(
					combineDismissPreference(
						{
							preferences: {},
						},
						'restore',
						dismissDate,
						false
					).restore
				).to.have.property( 'dismissedAt', dismissDate );
			} );

			test( 'should set dismissCount to 1 on initial dismiss', () => {
				expect(
					combineDismissPreference(
						{
							preferences: {},
						},
						'restore',
						Date.now(),
						false
					).restore
				).to.have.property( 'dismissCount', 1 );
			} );

			test( 'should increment dismissCount', () => {
				expect(
					combineDismissPreference(
						{
							preferences: {
								localValues: {
									'jetpack-review-prompt': {
										restore: {
											dismissCount: 1,
											dismissedAt: Date.now(),
											validFrom: null,
											reviewed: false,
										},
									},
								},
							},
						},
						'restore',
						Date.now(),
						false
					).restore
				).to.have.property( 'dismissCount', 2 );
			} );

			test( 'should set reviewed', () => {
				expect(
					combineDismissPreference(
						{
							preferences: {},
						},
						'restore',
						Date.now(),
						true
					).restore
				).to.have.property( 'reviewed', true );
			} );
		} );

		describe( 'combineValidPreference()', () => {
			test( 'should set validFrom', () => {
				const validFrom = Date.now();

				expect(
					combineValidPreference(
						{
							preferences: {},
						},
						'restore',
						validFrom
					).restore
				).to.have.property( 'validFrom', validFrom );
			} );
		} );
	} );
} );
