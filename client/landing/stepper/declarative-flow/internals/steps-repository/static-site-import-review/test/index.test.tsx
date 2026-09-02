/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import {
	useCreateStaticSiteImportSession,
	useStaticSiteImportSession,
} from '../../static-site-import/hooks/use-static-site-import-session';
import StaticSiteImportReview from '../index';

const submit = jest.fn();
const reviewProps = {
	navigation: { submit },
	stepName: 'static-site-import-review',
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
	Button: ( { children, ...props }: React.ComponentProps< 'button' > ) => (
		<button { ...props }>{ children }</button>
	),
	Card: ( { children }: React.PropsWithChildren ) => <div>{ children }</div>,
	CardBody: ( { children }: React.PropsWithChildren ) => <div>{ children }</div>,
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
jest.mock( '../../static-site-import/hooks/use-static-site-import-session' );

describe( 'StaticSiteImportReview', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( useCreateStaticSiteImportSession ).mockReturnValue( {} as never );
	} );

	it.each( [
		[ 'capture_queued', 'We are preparing to capture your site.' ],
		[ 'capturing', 'We are capturing your site content. This may take a few minutes.' ],
		[ 'compiling', 'We are preparing your import preview.' ],
	] as const )( 'keeps approval disabled while %s', ( state, message ) => {
		jest.mocked( useStaticSiteImportSession ).mockReturnValue( {
			data: { session_id: 'session-1', status: 'pending', state },
		} as never );

		render( <StaticSiteImportReview { ...reviewProps } /> );

		expect( screen.getByText( message ) ).toBeVisible();
		expect( screen.queryByText( 'Your import preview is ready.' ) ).not.toBeInTheDocument();
		expect( screen.getByTestId( 'static-site-import-approve' ) ).toBeDisabled();
	} );

	it( 'submits approval only after the preview is ready', () => {
		jest.mocked( useStaticSiteImportSession ).mockReturnValue( {
			data: {
				session_id: 'session-1',
				plan_hash: 'hash-1',
				status: 'pending',
				state: 'preview_ready',
				preview_summary: { pages: 2 },
			},
		} as never );

		render( <StaticSiteImportReview { ...reviewProps } /> );

		fireEvent.click( screen.getByTestId( 'static-site-import-approve' ) );

		expect( submit ).toHaveBeenCalledWith( {
			action: 'approved',
			sessionId: 'session-1',
			planHash: 'hash-1',
			status: 'pending',
			state: 'preview_ready',
			sourceDigest: undefined,
			previewSummary: { pages: 2 },
		} );
	} );
} );
