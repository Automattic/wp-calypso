/**
 * @jest-environment jsdom
 */

import { SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { render } from '@testing-library/react';
import React from 'react';
import SurveyManager from '../';
import { type Flow } from '../../../types';

jest.mock( '../../../steps-repository/components/migration-survey/async', () => {
	const AsyncMigrationSurvey = () => 'Mock Survey';

	return AsyncMigrationSurvey;
} );

jest.mock( '../../deferred-render', () => {
	const DeferredRender = ( { children }: { children: React.ReactNode; timeMs?: number } ) =>
		children;

	return { DeferredRender };
} );

describe( 'SurveyManager', () => {
	it( 'should render null when disabled prop is true', () => {
		const flow: Flow = {
			name: SITE_MIGRATION_FLOW,
			isSignupFlow: true,
			initialize: jest.fn(),
			useStepNavigation: jest.fn(),
		};

		const { container } = render( <SurveyManager disabled flow={ flow } /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render null when no flow is provided', () => {
		const { container } = render( <SurveyManager /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render null for flows not associated with a survey', () => {
		const nonMigrationFlow: Flow = {
			name: 'other-flow',
			isSignupFlow: true,
			initialize: jest.fn(),
			useStepNavigation: jest.fn(),
		};

		const { container } = render( <SurveyManager flow={ nonMigrationFlow } /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'should render survey for site migration flow', () => {
		const testFlow: Flow = {
			name: SITE_MIGRATION_FLOW,
			isSignupFlow: true,
			initialize: jest.fn(),
			useStepNavigation: jest.fn(),
		};

		const { getByText } = render( <SurveyManager flow={ testFlow } /> );

		expect( getByText( 'Mock Survey' ) ).toBeVisible();
	} );
} );
