/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import SiteGeneration from '../index';
import { useSiteGeneration } from '../use-site-generation';
import type { SiteGenerationState } from '../use-site-generation';

let mockState: SiteGenerationState;

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '../use-site-generation', () => ( {
	useSiteGeneration: jest.fn( () => mockState ),
} ) );

jest.mock( '../view', () => ( {
	SiteGenerationView: ( { onReload }: { onReload: () => void } ) => (
		<button onClick={ onReload }>Recover</button>
	),
} ) );

describe( 'SiteGeneration recovery', () => {
	const originalLocation = window.location;
	const navigation = { submit: jest.fn() };
	const useSiteGenerationMock = useSiteGeneration as jest.Mock;

	beforeEach( () => {
		jest.clearAllMocks();
		mockState = {
			status: 'failed',
			failureReason: 'build-failed',
			steps: [],
			retryBuild: null,
			isRetryingBuild: false,
		};
		Object.defineProperty( window, 'location', {
			value: {
				search:
					'?build_wow=1&siteId=123&siteSlug=example.wordpress.com&specId=spec-1&editorUrl=https%3A%2F%2Fexample.wordpress.com%2Fwp-admin%2Fadmin.php%3Fpage%3Deasy-site-editor&ref=site-card&source=site-overview',
				assign: jest.fn(),
				reload: jest.fn(),
			},
			configurable: true,
		} );
	} );

	afterEach( () => {
		Object.defineProperty( window, 'location', {
			value: originalLocation,
			configurable: true,
		} );
	} );

	const renderStep = () =>
		render(
			<SiteGeneration
				flow="ai-site-builder-spec"
				navigation={ navigation }
				stepName="site-generation"
			/>
		);

	it( 'reloads when a failed build has no server retry', () => {
		renderStep();
		fireEvent.click( screen.getByRole( 'button', { name: 'Recover' } ) );

		expect( window.location.reload ).toHaveBeenCalledTimes( 1 );
		expect( window.location.assign ).not.toHaveBeenCalled();
	} );

	it( 'uses the same fallback step IDs as the server checklist', () => {
		renderStep();

		const { steps } = useSiteGenerationMock.mock.calls[ 0 ][ 0 ];
		expect( steps.map( ( step: { id: string } ) => step.id ) ).toEqual( [
			'prepare',
			'design',
			'pages',
			'images',
			'polish',
			'publish',
		] );
	} );

	it( 'reloads when checking again after a timeout', () => {
		mockState.failureReason = 'timed-out';
		renderStep();
		fireEvent.click( screen.getByRole( 'button', { name: 'Recover' } ) );

		expect( window.location.reload ).toHaveBeenCalledTimes( 1 );
		expect( window.location.assign ).not.toHaveBeenCalled();
	} );
} );
