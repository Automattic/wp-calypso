/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import StaticSiteImportProgress from '../index';
import {
	useApproveStaticSiteImportSession,
	useStaticSiteImportSession,
} from '../../static-site-import/hooks/use-static-site-import-session';

const mutate = jest.fn();
const set = jest.fn();

jest.mock( '@automattic/onboarding', () => ( {
	Step: {
		CenteredColumnLayout: ( { children }: React.PropsWithChildren ) => <div>{ children }</div>,
		TopBar: () => <div />,
		Heading: ( { text }: { text: string } ) => <h1>{ text }</h1>,
	},
} ) );
jest.mock( '@wordpress/components', () => ( {
	Card: ( { children, ...props }: React.PropsWithChildren ) => <div { ...props }>{ children }</div>,
	CardBody: ( { children }: React.PropsWithChildren ) => <div>{ children }</div>,
	ProgressBar: () => <div>Progress</div>,
	Spinner: () => <div>Loading</div>,
} ) );
jest.mock( 'i18n-calypso', () => ( { useTranslate: () => ( text: string ) => text } ) );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams( 'staticSiteImportSessionId=session-1' ),
} ) );
jest.mock( 'calypso/landing/stepper/hooks/use-site-data', () => ( {
	useSiteData: () => ( { siteId: 123 } ),
} ) );
jest.mock( 'calypso/landing/stepper/declarative-flow/internals/state-manager/store', () => ( {
	useFlowState: () => ( { get: () => undefined, set } ),
} ) );
jest.mock( '../../static-site-import/hooks/use-static-site-import-session' );

describe( 'StaticSiteImportProgress', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useApproveStaticSiteImportSession ).mockReturnValue( { mutate } as never );
	} );

	it( 'approves a preview-ready session once across rerenders', () => {
		jest.mocked( useStaticSiteImportSession ).mockReturnValue( {
			data: { session_id: 'session-1', plan_hash: 'hash-1', status: 'pending', state: 'preview_ready' },
		} as never );

		const { rerender } = render( <StaticSiteImportProgress /> );
		rerender( <StaticSiteImportProgress /> );

		expect( mutate ).toHaveBeenCalledTimes( 1 );
		expect( mutate ).toHaveBeenCalledWith(
			{ siteId: 123, sessionId: 'session-1', planHash: 'hash-1' },
			expect.any( Object )
		);
	} );

	it.each( [
		[ 'finished', 'Your site import is complete' ],
		[ 'failed', 'Your site import could not be completed' ],
	] as const )( 'renders %s as a terminal state', ( state, heading ) => {
		jest.mocked( useStaticSiteImportSession ).mockReturnValue( {
			data: { session_id: 'session-1', status: state, state },
		} as never );

		render( <StaticSiteImportProgress /> );

		expect( screen.getByRole( 'heading', { name: heading } ) ).toBeVisible();
	} );
} );
