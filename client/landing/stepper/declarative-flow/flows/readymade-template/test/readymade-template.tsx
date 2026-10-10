/**
 * @jest-environment jsdom
 */
import wpcomRequest from '@automattic/data-stores/src/wpcom-request';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { select } from '@wordpress/data';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import readymadeTemplateFlow from '../readymade-template';
import type { PropsWithChildren } from 'react';

jest.mock( '@automattic/data-stores/src/wpcom-request', () => ( {
	__esModule: true,
	default: jest.fn(),
	canAccessWpcomApis: jest.fn( () => true ),
} ) );
jest.mock( 'calypso/state', () => ( { useDispatch: () => jest.fn() } ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { site: null, siteId: 123, siteSlug: 'test.wordpress.com' } ),
} ) );
jest.mock( 'calypso/a8c-for-agencies/hooks/use-url-query-param', () => ( {
	__esModule: true,
	default: () => ( { value: undefined } ),
} ) );
jest.mock( 'calypso/state/themes/hooks/use-theme-details', () => ( {
	useThemeDetails: () => ( { data: undefined } ),
} ) );

const navigate = jest.fn();
const renderNavigation = () => {
	const client = new QueryClient();
	return renderHook( () => readymadeTemplateFlow.useStepNavigation( 'processing', navigate ), {
		wrapper: ( { children }: PropsWithChildren ) => (
			<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
		),
	} );
};

beforeEach( () => {
	jest.clearAllMocks();
	jest.mocked( wpcomRequest ).mockResolvedValue( {} );
} );

it.each( [ '', undefined, {} ] )(
	'ignores an invalid launched site slug: %s',
	async ( siteSlug ) => {
		const { result } = renderNavigation();
		await act( async () => {
			await result.current.submit?.( { isLaunched: true, siteSlug } );
		} );
		expect( wpcomRequest ).not.toHaveBeenCalled();
		expect( navigate ).not.toHaveBeenCalled();
	}
);

it( 'saves launchpad settings under the numeric site ID before celebrating', async () => {
	const { result } = renderNavigation();
	await act( async () => {
		await result.current.submit?.( { isLaunched: true, siteSlug: 'test.wordpress.com' } );
	} );
	expect( wpcomRequest ).toHaveBeenCalledWith( {
		path: '/sites/123/settings',
		apiVersion: '1.4',
		body: { launchpad_screen: 'off' },
		method: 'POST',
	} );
	expect( select( SITE_STORE ).getSiteSettings( 123 ).launchpad_screen ).toBe( 'off' );
	expect( navigate ).toHaveBeenCalledWith( 'celebration-step' );
} );
