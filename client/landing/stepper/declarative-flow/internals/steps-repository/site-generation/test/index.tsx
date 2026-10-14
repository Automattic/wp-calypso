/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { pollForBuildWowStatus } from '../build-status-poller';
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

jest.mock( '../build-status-poller', () => ( {
	pollForBuildWowStatus: jest.fn( () => jest.fn() ),
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

	it.each( [
		'',
		'https://evil.example/wp-admin/site-editor.php?spec_id=untrusted',
		'https://old-domain.com/wp-admin/site-editor.php?source=old-source',
		// eslint-disable-next-line no-script-url
		'javascript:alert(1)',
	] )( 'uses the API destination and ignores an old editorUrl parameter: %s', ( editorUrl ) => {
		const query = new URLSearchParams( {
			siteSlug: 'example.wordpress.com',
			source: 'sites-dashboard',
		} );
		if ( editorUrl ) {
			query.set( 'editorUrl', editorUrl );
		}
		window.location.search = `?${ query }`;
		useSiteGenerationMock.mockImplementationOnce(
			jest.requireActual( '../use-site-generation' ).useSiteGeneration
		);
		renderStep();

		const statusPollMock = pollForBuildWowStatus as jest.Mock;
		expect( statusPollMock ).toHaveBeenCalledTimes( 1 );
		expect( statusPollMock.mock.calls[ 0 ][ 0 ].siteIdentifier ).toBe( 'example.wordpress.com' );
		expect( window.location.assign ).not.toHaveBeenCalled();
		act( () =>
			statusPollMock.mock.calls[ 0 ][ 0 ].onReady( {
				build_status: 'live',
				site_editor_url:
					'https://new-domain.com/wp-admin/site-editor.php?p=%2Fpage%2F12&canvas=edit',
			} )
		);
		expect( window.location.assign ).toHaveBeenCalledWith(
			'https://new-domain.com/wp-admin/site-editor.php?p=%2Fpage%2F12&canvas=edit&source=sites-dashboard'
		);
	} );

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
