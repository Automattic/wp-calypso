/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ProfilePanel } from '../profile-panel';

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

// Mock EmptyContent to keep the test focused while still rendering action links.
jest.mock( 'calypso/components/empty-content', () => ( {
	__esModule: true,
	default: ( {
		title,
		line,
		action,
		actionURL,
		actionTarget,
	}: {
		title?: string;
		line?: string;
		action?: string;
		actionURL?: string;
		actionTarget?: string;
	} ) => (
		<div>
			{ title && <h2>{ title }</h2> }
			{ line && <p>{ line }</p> }
			{ action && actionURL && (
				<a href={ actionURL } target={ actionTarget }>
					{ action }
				</a>
			) }
		</div>
	),
} ) );

describe( 'ProfilePanel', () => {
	it( 'renders the handle in the title', () => {
		render(
			<ProfilePanel
				handle="@alice@example.com"
				actorUrl="https://example.com/users/alice"
				siteHost="example.com"
			/>
		);

		expect( screen.getByText( /connected as @alice@example\.com/i ) ).toBeVisible();
	} );

	it( 'renders the site host in the subtitle', () => {
		render(
			<ProfilePanel
				handle="@alice@example.com"
				actorUrl="https://example.com/users/alice"
				siteHost="example.com"
			/>
		);

		expect( screen.getByText( /will appear on example\.com/i ) ).toBeVisible();
	} );

	it( 'renders an external link pointing at actorUrl', () => {
		render(
			<ProfilePanel
				handle="@alice@example.com"
				actorUrl="https://example.com/users/alice"
				siteHost="example.com"
			/>
		);

		const link = screen.getByRole( 'link', { name: /view your profile on example\.com/i } );
		expect( link ).toBeVisible();
		expect( link ).toHaveAttribute( 'href', 'https://example.com/users/alice' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );
} );
