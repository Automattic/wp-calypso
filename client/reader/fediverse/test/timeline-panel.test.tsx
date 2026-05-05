/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { TimelinePanel } from '../timeline-panel';

// Mock i18n-calypso to avoid the interpolate-components dependency chain.
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string, options?: { args?: Record< string, string > } ) => {
		if ( options?.args ) {
			return Object.entries( options.args ).reduce(
				( result, [ key, value ] ) => result.replace( `%(${ key })s`, value ),
				str
			);
		}
		return str;
	},
} ) );

// Mock EmptyContent to keep the test focused.
jest.mock( 'calypso/components/empty-content', () => ( {
	__esModule: true,
	default: ( { title, line }: { title?: string; line?: string } ) => (
		<div>
			{ title && <h2>{ title }</h2> }
			{ line && <p>{ line }</p> }
		</div>
	),
} ) );

describe( 'TimelinePanel', () => {
	it( 'renders the empty state title', () => {
		render( <TimelinePanel connectionId={ 1 } handle="@alice@example.com" /> );

		expect( screen.getByText( 'Your Fediverse activity will appear here' ) ).toBeVisible();
	} );

	it( 'renders the handle in the subtitle', () => {
		render( <TimelinePanel connectionId={ 1 } handle="@alice@example.com" /> );

		expect( screen.getByText( /connected as @alice@example\.com/i ) ).toBeVisible();
	} );
} );
