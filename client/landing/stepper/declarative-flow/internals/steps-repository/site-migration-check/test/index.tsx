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
		expect( screen.getByText( 'Source' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
			'href',
			'https://example.com'
		);
		expect(
			screen.getByText(
				'The content on this site will be copied. No changes will be made to the site itself.'
			)
		).toBeVisible();
		expect( screen.getByText( 'Destination' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'destination.wordpress.com' } ) ).toHaveAttribute(
			'href',
			'https://destination.wordpress.com'
		);
		expect( screen.getByText( /All of the content on this site will be replaced/ ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'WordPress site ↗' } ) ).not.toBeInTheDocument();
	};

	it( 'offers an upgrade for an ineligible destination', async () => {
		const { submit } = renderDestination( true );
		expectSiteComparison();
		expect( submit ).not.toHaveBeenCalled();
		expect(
			screen.getByText(
				'The destination site is on the Personal plan, which doesn’t support plugins. Upgrade it to continue the migration.'
			)
		).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();
		await userEvent.click( screen.getByRole( 'button', { name: 'Upgrade and continue' } ) );
		expect( submit ).toHaveBeenCalledWith( {
			action: 'continue',
			from: 'https://example.com',
			platform: 'wordpress',
			host: undefined,
		} );
	} );

	it( 'offers another site or a retry when the destination can’t be loaded', async () => {
		const submit = jest.fn();
		const retry = jest.fn();
		renderStep(
			<SiteMigrationCheck
				{ ...mockStepProps( { navigation: { submit } } ) }
				destinationSiteSlug="destination.wordpress.com"
				destinationFailed
				onRetryDestination={ retry }
			/>,
			{ initialEntry: '/site-migration-check?from=https://example.com&platform=wordpress' }
		);

		expect(
			screen.getAllByText( /We couldn’t load destination\.wordpress\.com/ )[ 0 ]
		).toBeVisible();
		expect(
			screen.queryByRole( 'img', { name: 'Source site to be copied' } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'heading', { name: 'Migrate example.com' } ) ).toBeVisible();
		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );
		expect( retry ).toHaveBeenCalledTimes( 1 );
		await userEvent.click( screen.getByRole( 'button', { name: 'Use a different site' } ) );
		expect( submit ).toHaveBeenCalledWith( {
			action: 'select-existing-site',
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
		expect(
			screen.getByText(
				'The destination site will keep its current domain. Once the migration is finished, we’ll help you switch it to example.com when you’re ready.'
			)
		).toBeVisible();
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
		expect( screen.getByRole( 'img', { name: 'Site preview' } ) ).toHaveAttribute(
			'data-viewport',
			'1200x800'
		);
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

	it.each( [ 'ineligible', 'eligible' ] as const )(
		'shows the WordPress.com actions with copy eligibility %s',
		async ( copySiteEligibility ) => {
			const canCopySite = copySiteEligibility === 'eligible';
			const submit = jest.fn();
			renderStep(
				<SiteMigrationCheck
					{ ...mockStepProps( { navigation: { submit } } ) }
					copySiteEligibility={ copySiteEligibility }
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
			expect( screen.getByText( 'Make a copy of your site' ) ).toBeVisible();
			expect( screen.queryAllByRole( 'link', { name: /Make a copy of your site/ } ) ).toHaveLength(
				canCopySite ? 0 : 1
			);
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

	it( 'explains why an ineligible site can’t be copied', () => {
		renderStep( <SiteMigrationCheck { ...mockStepProps() } copySiteEligibility="ineligible" />, {
			initialEntry:
				'/site-migration-check?from=https://cotrim.dev/&platform=wordpress&isWpcom=true',
		} );
		const link = screen.getByRole( 'link', { name: /Make a copy of your site/ } );
		expect( link ).toHaveTextContent( 'This site isn’t eligible to be copied. Learn more' );
		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/support/copy-a-site/' );
		expect( link ).toHaveAttribute( 'target', '_blank' );
	} );

	it( 'shows a disabled copy action while eligibility is loading', async () => {
		const submit = jest.fn();
		renderStep(
			<SiteMigrationCheck
				{ ...mockStepProps( { navigation: { submit } } ) }
				copySiteEligibility="loading"
			/>,
			{
				initialEntry:
					'/site-migration-check?from=https://cotrim.dev/&platform=wordpress&isWpcom=true',
			}
		);
		const button = screen.getByRole( 'button', { name: /Make a copy of your site/ } );
		expect( button ).toBeDisabled();
		expect( button ).toHaveTextContent( 'Checking if your site can be copied…' );
		expect(
			screen.queryByRole( 'link', { name: /Make a copy of your site/ } )
		).not.toBeInTheDocument();
		await userEvent.click( button );
		expect( submit ).not.toHaveBeenCalled();
	} );
} );
