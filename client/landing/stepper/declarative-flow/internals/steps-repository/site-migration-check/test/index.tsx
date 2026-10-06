/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SiteMigrationCheck from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

jest.mock( '../../site-migration-instructions/site-preview', () => ( {
	SitePreview: () => <div>Site preview</div>,
} ) );

describe( 'SiteMigrationCheck', () => {
	it( 'shows the supplied site and waits for Continue, with the expert link disabled', async () => {
		const submit = jest.fn();
		renderStep( <SiteMigrationCheck { ...mockStepProps( { navigation: { submit } } ) } />, {
			initialEntry:
				'/site-migration-check?from=https://example.com&platform=wordpress&host=bluehost',
		} );

		expect( screen.getByRole( 'heading', { name: 'We can copy your whole site' } ) ).toBeVisible();
		expect( screen.getByText( 'example.com' ) ).toBeVisible();
		expect( screen.getByText( 'Site preview' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'WordPress site ↗' } ) ).toHaveAttribute(
			'href',
			'https://example.com'
		);
		expect( screen.getByRole( 'button', { name: /Talk to a migration expert/ } ) ).toBeDisabled();
		expect( submit ).not.toHaveBeenCalled();

		await userEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		expect( submit ).toHaveBeenCalledWith( {
			action: 'continue',
			from: 'https://example.com',
			platform: 'wordpress',
			host: 'bluehost',
		} );

		await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );
		expect( submit ).toHaveBeenLastCalledWith( { action: 'back' } );
	} );

	it.each( [
		'',
		'?from=javascript:alert(1)&platform=wordpress',
		'?from=https://example.com&platform=wix',
		'?from=https://example.com&platform=unknown&isWpcom=true',
		'?from=https://example.com&platform=squarespace&isWpcom=true',
	] )( 'returns to address entry instead of rendering an invalid source: %s', ( query ) => {
		const submit = jest.fn();
		renderStep( <SiteMigrationCheck { ...mockStepProps( { navigation: { submit } } ) } />, {
			initialEntry: `/site-migration-check${ query }`,
		} );
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'heading' ) ).not.toBeInTheDocument();
		expect( submit ).toHaveBeenCalledWith( { action: 'back' } );
	} );

	it( 'shows unknown-platform choices, with only the backup action enabled', async () => {
		const submit = jest.fn();
		renderStep( <SiteMigrationCheck { ...mockStepProps( { navigation: { submit } } ) } />, {
			initialEntry: '/site-migration-check?from=https://bzinus.pt/&platform=unknown&isWpcom=false',
		} );
		expect(
			screen.getByRole( 'heading', { name: 'We couldn’t tell what your site runs on' } )
		).toBeVisible();
		expect( screen.getByText( 'bzinus.pt' ) ).toBeVisible();
		expect( screen.getByText( 'unknown platform' ) ).toBeVisible();
		expect( screen.queryByText( 'Site preview' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /It’s a WordPress site/ } ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: /It’s built on something else/ } ) ).toBeDisabled();
		expect( submit ).not.toHaveBeenCalled();
		await userEvent.click( screen.getByRole( 'button', { name: /I have a backup file/ } ) );
		expect( submit ).toHaveBeenCalledWith( { action: 'backup_file' } );
	} );

	it( 'shows the WordPress.com result with unfinished choices disabled and no copy promise', async () => {
		const submit = jest.fn();
		renderStep( <SiteMigrationCheck { ...mockStepProps( { navigation: { submit } } ) } />, {
			initialEntry:
				'/site-migration-check?from=https://cotrim.dev/&platform=wordpress&isWpcom=true',
		} );
		expect(
			screen.getByRole( 'heading', { name: 'Your site is already on WordPress.com' } )
		).toBeVisible();
		expect( screen.getByText( 'cotrim.dev' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'WordPress site ↗' } ) ).toHaveAttribute(
			'href',
			'https://cotrim.dev/'
		);
		for ( const name of [
			/Make a copy of your site/,
			/Transfer your domain/,
			/Get access to your site/,
		] ) {
			const button = screen.getByRole( 'button', { name } );
			expect( button ).toBeDisabled();
			await userEvent.click( button );
		}
		expect( screen.queryByText( 'Site preview' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();
		expect(
			screen.queryByText( /cotrim\.dev runs on WordPress, so we copy all of it/ )
		).not.toBeInTheDocument();
		expect( submit ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'squarespace', 'Squarespace' ],
		[ 'medium', 'Medium' ],
	] )( 'shows the %s result with all forward actions disabled', async ( platform, name ) => {
		const submit = jest.fn();
		renderStep( <SiteMigrationCheck { ...mockStepProps( { navigation: { submit } } ) } />, {
			initialEntry: `/site-migration-check?from=https://example.com/&platform=${ platform }`,
		} );
		expect(
			screen.getByRole( 'heading', { name: `Your site is built with ${ name }` } )
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: `${ name } site ↗` } ) ).toHaveAttribute(
			'href',
			'https://example.com/'
		);
		expect( screen.queryByText( 'Site preview' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();
		for ( const name of [
			/Have our team migrate it for you/,
			/Have a designer build you a new site/,
			'I just want to import my content',
			'Have our team do it',
		] ) {
			const button = screen.getByRole( 'button', { name } );
			expect( button ).toBeDisabled();
			await userEvent.click( button );
		}
		expect( submit ).not.toHaveBeenCalled();
		await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );
		expect( submit ).toHaveBeenCalledWith( { action: 'back' } );
	} );

	it.each( [ 'platform=unknown', 'platform=wordpress&isWpcom=true' ] )(
		'returns to address entry through Back or changing the URL for %s',
		async ( query ) => {
			const submit = jest.fn();
			renderStep( <SiteMigrationCheck { ...mockStepProps( { navigation: { submit } } ) } />, {
				initialEntry: `/site-migration-check?from=https://example.com&${ query }`,
			} );
			await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );
			expect( submit ).toHaveBeenLastCalledWith( { action: 'back' } );
			await userEvent.click(
				screen.getByRole( 'button', { name: 'Not the site you meant? Enter a different URL' } )
			);
			expect( submit ).toHaveBeenLastCalledWith( { action: 'back' } );
		}
	);
} );
