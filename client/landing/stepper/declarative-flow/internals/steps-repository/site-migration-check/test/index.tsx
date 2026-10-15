/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SiteMigrationCheck from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

jest.mock( '../../site-migration-instructions/site-preview', () => ( {
	SitePreview: ( {
		url,
		label,
		mshotsOptions,
	}: {
		url?: string;
		label?: string;
		mshotsOptions?: { vpw: number; vph: number };
	} ) => (
		<div
			role="img"
			aria-label={ label || 'Site preview' }
			data-url={ url }
			data-viewport={ mshotsOptions ? `${ mshotsOptions.vpw }x${ mshotsOptions.vph }` : undefined }
		>
			Site preview
		</div>
	),
} ) );

describe( 'SiteMigrationCheck', () => {
	const renderDestination = ( needsUpgrade = false ) => {
		const submit = jest.fn();
		const goBack = jest.fn();
		renderStep(
			<SiteMigrationCheck
				{ ...mockStepProps( { navigation: { submit, goBack } } ) }
				destinationSiteSlug="destination.wordpress.com"
				destinationSiteUrl={ needsUpgrade ? undefined : 'https://destination.wordpress.com' }
				destinationPlanName="Personal"
				needsUpgrade={ needsUpgrade }
			/>,
			{ initialEntry: '/site-migration-check?from=https://example.com&platform=wordpress' }
		);
		return { submit, goBack };
	};

	const expectSiteComparison = () => {
		for ( const [ label, url ] of [
			[ 'Current destination site', 'https://destination.wordpress.com' ],
			[ 'Source site to be copied', 'https://example.com' ],
		] ) {
			const preview = screen.getByRole( 'img', { name: label } );
			expect( preview ).toHaveAttribute( 'data-url', url );
			expect( preview ).toHaveAttribute( 'data-viewport', '1200x800' );
		}
		expect(
			screen.getByText( /Its posts, pages, media, theme, plugins, and settings are replaced/ )
		).toBeVisible();
	};

	it( 'offers an upgrade for an ineligible destination', async () => {
		const { submit } = renderDestination( true );
		expectSiteComparison();
		expect( submit ).not.toHaveBeenCalled();
		expect( screen.getByText( /Personal plan, which can’t run plugins/ ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();
		await userEvent.click( screen.getByRole( 'button', { name: 'Upgrade and continue' } ) );
		expect( submit ).toHaveBeenCalledWith( {
			action: 'continue',
			from: 'https://example.com',
			platform: 'wordpress',
			host: undefined,
		} );
	} );

	it( 'waits for destination eligibility before offering Continue', () => {
		renderStep( <SiteMigrationCheck { ...mockStepProps() } isLoadingDestination />, {
			initialEntry: '/site-migration-check?from=https://example.com&platform=wordpress',
		} );
		for ( const name of [ 'Continue', 'Upgrade and continue', 'Replace and continue' ] ) {
			expect( screen.queryByRole( 'button', { name } ) ).not.toBeInTheDocument();
		}
	} );

	it( 'offers another destination or submits replacement once for an eligible site', async () => {
		const { submit, goBack } = renderDestination();
		expectSiteComparison();
		await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );
		expect( goBack ).toHaveBeenCalledTimes( 1 );
		expect( submit ).not.toHaveBeenCalled();
		await userEvent.click( screen.getByRole( 'button', { name: 'Use a different site' } ) );
		expect( submit ).toHaveBeenLastCalledWith( {
			action: 'select-existing-site',
			from: 'https://example.com',
			platform: 'wordpress',
			host: undefined,
		} );
		await userEvent.click( screen.getByRole( 'button', { name: 'Replace and continue' } ) );
		expect( submit ).toHaveBeenLastCalledWith( {
			action: 'continue',
			from: 'https://example.com',
			platform: 'wordpress',
			host: undefined,
		} );
		expect( submit ).toHaveBeenCalledTimes( 2 );
		expect(
			screen.queryByRole( 'button', { name: 'Replace and continue' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Upgrade and continue' } )
		).not.toBeInTheDocument();
	} );

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
	] )( 'returns to address entry instead of rendering an invalid source: %s', ( query ) => {
		const submit = jest.fn();
		renderStep( <SiteMigrationCheck { ...mockStepProps( { navigation: { submit } } ) } />, {
			initialEntry: `/site-migration-check${ query }`,
		} );
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'heading' ) ).not.toBeInTheDocument();
		expect( submit ).toHaveBeenCalledWith( { action: 'back' } );
	} );

	it.each( [ false, true ] )(
		'shows the WordPress.com actions with copy eligibility %s',
		async ( canCopySite ) => {
			const submit = jest.fn();
			renderStep(
				<SiteMigrationCheck
					{ ...mockStepProps( { navigation: { submit } } ) }
					canCopySite={ canCopySite }
				/>,
				{
					initialEntry:
						'/site-migration-check?from=https://cotrim.dev/&platform=wordpress&isWpcom=true',
				}
			);
			expect(
				screen.getByRole( 'heading', { name: 'Your site is already on WordPress.com' } )
			).toBeVisible();
			expect( screen.getByText( 'cotrim.dev' ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'WordPress site ↗' } ) ).toHaveAttribute(
				'href',
				'https://cotrim.dev/'
			);
			expect(
				screen.queryAllByRole( 'button', { name: /Make a copy of your site/ } )
			).toHaveLength( canCopySite ? 1 : 0 );
			for ( const [ name, action ] of [
				...( canCopySite ? [ [ /Make a copy of your site/, 'copy-site' ] as const ] : [] ),
				[ /Transfer your domain/, 'transfer-domain' ],
				[ /Get access to your site/, 'get-access' ],
			] ) {
				await userEvent.click( screen.getByRole( 'button', { name } ) );
				expect( submit ).toHaveBeenLastCalledWith( {
					action,
					from: 'https://cotrim.dev/',
					platform: 'wordpress',
					host: undefined,
				} );
			}
			expect( screen.queryByText( 'Site preview' ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();
			for ( const name of [ 'Back', 'Not the site you meant? Enter a different URL' ] ) {
				await userEvent.click( screen.getByRole( 'button', { name } ) );
				expect( submit ).toHaveBeenLastCalledWith( { action: 'back' } );
			}
		}
	);
} );
