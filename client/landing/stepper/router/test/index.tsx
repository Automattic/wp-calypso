import React from 'react';
import { Flow, From, To, BackTo, createNavigator } from '../index';

interface FlowContext {
	siteSlug: string;
}

describe( 'Stepper Router', () => {
	const positiveCondition = () => true;
	const negativeCondition = () => false;

	it( 'return all the router steps', () => {
		const result = createNavigator(
			<Flow name="test" persistParam={ [ 'from', 'to', 'siteSlug' ] }>
				<From step="STEP_1">
					<To step="STEP_2A" when={ positiveCondition } />
					<To step="STEP_2B" />
					<BackTo step="STEP_1" when={ positiveCondition } />
				</From>
				<From step="STEP_2">
					<To step="STEP_3A" when={ positiveCondition } />
				</From>
			</Flow>
		);

		expect( result.useSteps() ).toEqual( [ 'STEP_1', 'STEP_2' ] );
	} );

	describe( 'useStepNavigation', () => {
		it( 'navigates to first available "to" step', () => {
			const navigate = jest.fn();

			const { useStepNavigation } = createNavigator(
				<Flow name="test" persistParam={ [ 'from', 'to', 'siteSlug' ] }>
					<From step="STEP_1">
						<To step="STEP_2A" />
						<To step="STEP_2B" />
					</From>
				</Flow>
			);

			useStepNavigation( 'STEP_1', navigate ).submit();
			expect( navigate ).toHaveBeenCalledWith( '/test/STEP_2A' );
		} );

		it( 'navigates to first available "to" step when condition is not met', () => {
			const navigate = jest.fn();
			const { useStepNavigation } = createNavigator(
				<Flow name="test" persistParam={ [ 'from', 'to', 'siteSlug' ] }>
					<From step="STEP_1">
						<To step="STEP_2A" when={ negativeCondition } />
						<To step="STEP_2B" />
					</From>
				</Flow>
			);
			useStepNavigation( 'STEP_1', navigate ).submit();
			expect( navigate ).toHaveBeenCalledWith( '/test/STEP_2B' );
		} );

		it( 'navigates to first available "to" step when condition is met using provider dependency', () => {
			const navigate = jest.fn();
			const providerDependency = {
				siteSlug: 'hasSiteSlug',
			};

			const whenHasSiteSlug = ( context: FlowContext ) => context.siteSlug === 'hasSiteSlug';

			const { useStepNavigation } = createNavigator(
				<Flow name="test" persistParam={ [ 'from', 'to', 'siteSlug' ] }>
					<From step="STEP_1">
						<To step="STEP_2A" when={ whenHasSiteSlug } />
						<To step="STEP_2B" />
					</From>
				</Flow>
			);

			useStepNavigation( 'STEP_1', navigate ).submit( providerDependency );
			expect( navigate ).toHaveBeenCalledWith( '/test/STEP_2A' );
		} );

		it( 'navigates from second step', () => {
			const navigate = jest.fn();

			const { useStepNavigation } = createNavigator(
				<Flow name="test" persistParam={ [ 'from', 'to', 'siteSlug' ] }>
					<From step="STEP_1">
						<To step="STEP_2A" />
					</From>
					<From step="STEP_2A">
						<To step="STEP_3A" />
					</From>
					<From step="STEP_3A">
						<To step="STEP_4A" />
					</From>
				</Flow>
			);

			useStepNavigation( 'STEP_2A', navigate ).submit( {} );
			expect( navigate ).toHaveBeenCalledWith( '/test/STEP_3A' );
		} );
	} );
} );
