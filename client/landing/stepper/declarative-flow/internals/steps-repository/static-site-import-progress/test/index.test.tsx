/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import {
	useApproveStaticSiteImportSession,
	useStaticSiteImportSession,
} from '../../static-site-import/hooks/use-static-site-import-session';
import StaticSiteImportProgress from '../index';

const mockMutate = jest.fn();
const mockSet = jest.fn();
const progressProps = {
	navigation: { submit: jest.fn() },
	stepName: 'static-site-import-progress',
	flow: 'site-migration',
};

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
	useFlowState: () => ( { get: () => undefined, set: mockSet } ),
} ) );
jest.mock( '../../static-site-import/hooks/use-static-site-import-session' );

describe( 'StaticSiteImportProgress', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest
			.mocked( useApproveStaticSiteImportSession )
			.mockReturnValue( { mutate: mockMutate } as never );
	} );

	it( 'approves a preview-ready session once across rerenders', () => {
		jest.mocked( useStaticSiteImportSession ).mockReturnValue( {
			data: {
				session_id: 'session-1',
				plan_hash: 'hash-1',
				status: 'pending',
				state: 'preview_ready',
			},
		} as never );

		const { rerender } = render( <StaticSiteImportProgress { ...progressProps } /> );
		rerender( <StaticSiteImportProgress { ...progressProps } /> );

		expect( mockMutate ).toHaveBeenCalledTimes( 1 );
		expect( mockMutate ).toHaveBeenCalledWith(
			{ siteId: 123, sessionId: 'session-1', planHash: 'hash-1' },
			expect.any( Object )
		);
	} );

	it.each( [
		[ 'finished', 'Your imported content is ready.' ],
		[ 'failed', 'Please try again later or contact support.' ],
	] as const )( 'renders %s as a terminal state', ( state, message ) => {
		jest.mocked( useStaticSiteImportSession ).mockReturnValue( {
			data: { session_id: 'session-1', status: state, state },
		} as never );

		render( <StaticSiteImportProgress { ...progressProps } /> );

		expect( screen.getByText( message ) ).toBeVisible();
	} );
} );
