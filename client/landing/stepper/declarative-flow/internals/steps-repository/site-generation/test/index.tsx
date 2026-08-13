/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react';
import SiteGeneration from '../index';
import type { SiteGenerationState } from '../use-site-generation';

let mockState: SiteGenerationState;

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );

jest.mock( 'calypso/components/data/document-head', () => () => null );

jest.mock( '../use-site-generation', () => ( {
	useSiteGeneration: () => mockState,
} ) );

jest.mock( '../view', () => ( {
	SiteGenerationView: ( { onRetry }: { onRetry: () => void } ) => (
		<button onClick={ onRetry }>Recover</button>
	),
} ) );

describe( 'SiteGeneration recovery', () => {
	const originalLocation = window.location;
	const navigation = { submit: jest.fn() };

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

	it( 'returns a failed build to Site Spec without reusing the failed spec', () => {
		renderStep();
		fireEvent.click( screen.getByRole( 'button', { name: 'Recover' } ) );

		expect( window.location.assign ).toHaveBeenCalledTimes( 1 );
		const destination = new URL(
			( window.location.assign as jest.Mock ).mock.calls[ 0 ][ 0 ],
			'https://wordpress.com'
		);
		expect( destination.pathname ).toBe( '/setup/ai-site-builder-spec/site-spec' );
		expect( destination.searchParams.get( 'build_wow' ) ).toBe( '1' );
		expect( destination.searchParams.get( 'siteId' ) ).toBe( '123' );
		expect( destination.searchParams.get( 'siteSlug' ) ).toBe( 'example.wordpress.com' );
		expect( destination.searchParams.get( 'ref' ) ).toBe( 'site-card' );
		expect( destination.searchParams.get( 'source' ) ).toBe( 'site-overview' );
		expect( destination.searchParams.has( 'specId' ) ).toBe( false );
		expect( destination.searchParams.has( 'editorUrl' ) ).toBe( false );
		expect( window.location.reload ).not.toHaveBeenCalled();
	} );

	it( 'reloads when checking again after a timeout', () => {
		mockState.failureReason = 'timed-out';
		renderStep();
		fireEvent.click( screen.getByRole( 'button', { name: 'Recover' } ) );

		expect( window.location.reload ).toHaveBeenCalledTimes( 1 );
		expect( window.location.assign ).not.toHaveBeenCalled();
	} );
} );
