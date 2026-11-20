/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import SiteMigrationCheck from '..';
import { mockStepProps, renderStep } from '../../test/helpers';

jest.mock( 'calypso/data/site-profiler/use-analyze-url-query', () => ( {
	useAnalyzeUrlQuery: jest.fn( () => ( { data: undefined, error: null } ) ),
} ) );

jest.mock( '../../../components/site-preview-panel', () => ( {
	SitePreviewPanel: ( { children }: { children: React.ReactNode } ) => <aside>{ children }</aside>,
	SiteWindow: ( {
		url,
		address,
		isUnavailable,
	}: {
		url: string;
		address: string;
		isUnavailable?: boolean;
	} ) => (
		<div
			role="img"
			aria-label={ `Preview of ${ address }` }
			data-url={ url }
			data-unavailable={ isUnavailable ? 'true' : undefined }
		>
			Site preview
		</div>
	),
} ) );

describe( 'SiteMigrationCheck', () => {
	beforeEach( () => {
		jest.mocked( useAnalyzeUrlQuery ).mockReturnValue( {
			data: undefined,
			error: null,
		} as unknown as ReturnType< typeof useAnalyzeUrlQuery > );
	} );

	const renderDestination = ( needsUpgrade = false ) => {
		const submit = jest.fn();
		const goBack = jest.fn();
		renderStep(
			<SiteMigrationCheck
				{ ...mockStepProps( { navigation: { submit, goBack } } ) }
				destinationSiteSlug="destination.wordpress.com"
				destinationSiteUrl={ needsUpgrade ? undefined : 'https://destination.wordpress.com' }
				needsUpgrade={ needsUpgrade }
			/>,
			{ initialEntry: '/site-migration-check?from=https://example.com&platform=wordpress' }
		);
		return { submit, goBack };
	};

	const expectSourceAndDestination = () => {
		for ( const [ label, url ] of [
			[ 'Preview of example.com', 'https://example.com' ],
			[ 'Preview of destination.wordpress.com', 'https://destination.wordpress.com' ],
		] ) {
			expect( screen.getByRole( 'img', { name: label } ) ).toHaveAttribute( 'data-url', url );
		}
		expect( screen.getByText( 'Everything on this site will be replaced.' ) ).toBeVisible();
		expect( screen.getByText( 'example.com today: this is what we’ll copy' ) ).toBeVisible();
		expect( screen.queryByText( 'What we’ll copy over' ) ).not.toBeInTheDocument();
	};

	const expectChangeLinks = async ( submit: jest.Mock, from = 'https://example.com' ) => {
		await userEvent.click( screen.getByRole( 'button', { name: 'Change the destination site' } ) );
		expect( submit ).toHaveBeenLastCalledWith( {
			action: 'select-existing-site',
			from,
			platform: 'wordpress',
			host: undefined,
		} );
		await userEvent.click( screen.getByRole( 'button', { name: 'Change the site to copy' } ) );
		expect( submit ).toHaveBeenLastCalledWith( { action: 'back' } );
	};

	it( 'replaces and continues for a destination that needs a plan first', async () => {
		const { submit } = renderDestination( true );
		expect( screen.getByRole( 'heading', { name: 'We can copy your whole site' } ) ).toBeVisible();
		expect( screen.getByText( 'To your existing WordPress.com site' ) ).toBeVisible();
		expectSourceAndDestination();
		expect( screen.queryByRole( 'button', { name: 'Continue' } ) ).not.toBeInTheDocument();
		await userEvent.click( screen.getByRole( 'button', { name: 'Replace and continue' } ) );
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

		expect( screen.getByRole( 'alert' ) ).toHaveTextContent(
			'We couldn’t load the site you picked'
		);
		expect( screen.getByText( 'Couldn’t load' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Use a different site' } )
		).not.toBeInTheDocument();
		expect(
			screen.queryByRole( 'img', { name: 'Preview of destination.wordpress.com' } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'heading', { name: 'We can copy your whole site' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /continue/i } ) ).not.toBeInTheDocument();
		await userEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );
		expect( retry ).toHaveBeenCalledTimes( 1 );
		await expectChangeLinks( submit );
	} );

	it( 'leaves out the destination’s Change link when there are no sites to pick', () => {
		renderStep( <SiteMigrationCheck { ...mockStepProps() } canPickDestination={ false } />, {
			initialEntry: '/site-migration-check?from=https://example.com&platform=wordpress',
		} );
		expect( screen.getByText( 'A new WordPress.com site' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Change the site to copy' } ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Change the destination site' } )
		).not.toBeInTheDocument();
	} );

	describe( 'a source picked as WordPress by hand', () => {
		const manualEntry =
			'/site-migration-check?from=https://example.com&platform=wordpress&manualPlatform=wordpress';
		// The fixtures only carry the fields the step reads.
		const analysis = ( result: {
			data?: Record< string, unknown >;
			error: unknown;
			isLoading?: boolean;
		} ) =>
			jest
				.mocked( useAnalyzeUrlQuery )
				.mockReturnValue( result as unknown as ReturnType< typeof useAnalyzeUrlQuery > );

		it( 'waits for the source checks before showing the page', () => {
			analysis( { data: undefined, error: null, isLoading: true } );
			renderStep( <SiteMigrationCheck { ...mockStepProps() } />, { initialEntry: manualEntry } );
			expect(
				screen.queryByRole( 'heading', { name: 'We can copy your whole site' } )
			).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /continue/i } ) ).not.toBeInTheDocument();
		} );

		it( 'warns that the source couldn’t be reached but still continues', async () => {
			analysis( { data: undefined, error: { code: 'http_request_failed' } as never } );
			const submit = jest.fn();
			renderStep( <SiteMigrationCheck { ...mockStepProps( { navigation: { submit } } ) } />, {
				initialEntry: manualEntry,
			} );
			expect( screen.getByRole( 'heading', { name: 'Is this a WordPress site?' } ) ).toBeVisible();
			expect( screen.getByRole( 'alert' ) ).toHaveTextContent( 'We couldn’t reach your site' );
			expect( screen.getByText( 'Not loading right now' ) ).toBeVisible();
			expect( screen.getByRole( 'img', { name: 'Preview of example.com' } ) ).toHaveAttribute(
				'data-unavailable',
				'true'
			);
			expect( screen.getByText( 'What we’ll copy over' ) ).toBeVisible();
			await userEvent.click(
				screen.getByRole( 'button', { name: 'My site is WordPress, continue' } )
			);
			expect( submit ).toHaveBeenCalledWith( {
				action: 'continue',
				from: 'https://example.com',
				platform: 'wordpress',
				host: undefined,
			} );
		} );

		it( 'warns that a source looks like another platform but still continues', async () => {
			analysis( { data: { url: 'https://example.com', platform: 'wix' }, error: null } );
			const submit = jest.fn();
			renderStep( <SiteMigrationCheck { ...mockStepProps( { navigation: { submit } } ) } />, {
				initialEntry: manualEntry,
			} );
			expect( screen.getByRole( 'heading', { name: 'Is this a WordPress site?' } ) ).toBeVisible();
			expect( screen.getByRole( 'alert' ) ).toHaveTextContent( 'This looks like a Wix site' );
			expect( screen.getByText( 'From · Wix' ) ).toBeVisible();
			await userEvent.click(
				screen.getByRole( 'button', { name: 'My site is WordPress, continue' } )
			);
			expect( submit ).toHaveBeenCalledWith( {
				action: 'continue',
				from: 'https://example.com',
				platform: 'wordpress',
				host: undefined,
			} );
		} );

		it( 'keeps Replace and continue when the warning comes with a destination', () => {
			analysis( { data: { url: 'https://example.com', platform: 'wix' }, error: null } );
			renderStep(
				<SiteMigrationCheck
					{ ...mockStepProps() }
					destinationSiteSlug="destination.wordpress.com"
					destinationSiteUrl="https://destination.wordpress.com"
				/>,
				{ initialEntry: manualEntry }
			);
			expect( screen.getByRole( 'alert' ) ).toHaveTextContent( 'This looks like a Wix site' );
			expect( screen.getByRole( 'button', { name: 'Replace and continue' } ) ).toBeVisible();
			expect(
				screen.queryByRole( 'button', { name: 'My site is WordPress, continue' } )
			).not.toBeInTheDocument();
		} );

		it( 'warns when the analyzer failed without saying why', () => {
			analysis( { data: undefined, error: { code: 'internal_server_error' } } );
			renderStep( <SiteMigrationCheck { ...mockStepProps() } />, { initialEntry: manualEntry } );
			expect( screen.getByRole( 'alert' ) ).toHaveTextContent(
				'We couldn’t confirm this is a WordPress site'
			);
			expect(
				screen.queryByText( /It runs on WordPress, so everything comes across/ )
			).not.toBeInTheDocument();
		} );

		it( 'warns when the platform couldn’t be told', () => {
			analysis( { data: { url: 'https://example.com', platform: 'unknown' }, error: null } );
			renderStep( <SiteMigrationCheck { ...mockStepProps() } />, { initialEntry: manualEntry } );
			expect( screen.getByRole( 'alert' ) ).toHaveTextContent(
				'We couldn’t confirm this is a WordPress site'
			);
			expect( screen.getByText( 'From your WordPress site' ) ).toBeVisible();
			expect(
				screen.getByRole( 'button', { name: 'My site is WordPress, continue' } )
			).toBeVisible();
		} );

		it( 'doesn’t check a source that was detected as WordPress', () => {
			analysis( { data: { url: 'https://example.com', platform: 'wix' }, error: null } );
			renderStep( <SiteMigrationCheck { ...mockStepProps() } />, {
				initialEntry: '/site-migration-check?from=https://example.com&platform=wordpress',
			} );
			expect( useAnalyzeUrlQuery ).toHaveBeenLastCalledWith(
				'https://example.com',
				false,
				Infinity
			);
			expect( screen.queryByRole( 'alert' ) ).not.toBeInTheDocument();
			expect( screen.getByText( 'What we’ll copy over' ) ).toBeVisible();
		} );
	} );

	it( 'waits for destination eligibility before offering Continue', () => {
		renderStep( <SiteMigrationCheck { ...mockStepProps() } isLoadingDestination />, {
			initialEntry: '/site-migration-check?from=https://example.com&platform=wordpress',
		} );
		for ( const name of [ 'Continue', 'Replace and continue' ] ) {
			expect( screen.queryByRole( 'button', { name } ) ).not.toBeInTheDocument();
		}
	} );

	it( 'offers another destination or submits replacement once for an eligible site', async () => {
		const { submit, goBack } = renderDestination();
		expect( screen.getByRole( 'heading', { name: 'We can copy your whole site' } ) ).toBeVisible();
		expectSourceAndDestination();
		await userEvent.click( screen.getByRole( 'button', { name: 'Back' } ) );
		expect( goBack ).toHaveBeenCalledTimes( 1 );
		expect( submit ).not.toHaveBeenCalled();
		await expectChangeLinks( submit );
		await userEvent.click( screen.getByRole( 'button', { name: 'Replace and continue' } ) );
		expect( submit ).toHaveBeenLastCalledWith( {
			action: 'continue',
			from: 'https://example.com',
			platform: 'wordpress',
			host: undefined,
		} );
		expect( submit ).toHaveBeenCalledTimes( 3 );
		expect(
			screen.queryByRole( 'button', { name: 'Replace and continue' } )
		).not.toBeInTheDocument();
	} );

	it.each( [ false, true ] )(
		'blocks a source that resolves to the destination (needs upgrade: %s)',
		async ( needsUpgrade ) => {
			const submit = jest.fn();
			renderStep(
				<SiteMigrationCheck
					{ ...mockStepProps( { navigation: { submit } } ) }
					destinationSiteSlug="destination.wordpress.com"
					destinationSiteUrls={ [ 'destination.wordpress.com', 'https://www.example.com' ] }
					needsUpgrade={ needsUpgrade }
				/>,
				{ initialEntry: '/site-migration-check?from=https://example.com/&platform=wordpress' }
			);
			expect( screen.getByRole( 'heading', { name: 'Pick two different sites' } ) ).toBeVisible();
			expect( screen.getByRole( 'alert' ) ).toHaveTextContent( 'You picked the same site twice' );
			expect( screen.getByText( 'Same as the destination' ) ).toBeVisible();
			for ( const name of [ 'Continue', 'Replace and continue' ] ) {
				expect( screen.queryByRole( 'button', { name } ) ).not.toBeInTheDocument();
			}
			expect( screen.queryByText( /will be replaced/ ) ).not.toBeInTheDocument();
			await expectChangeLinks( submit, 'https://example.com/' );
			await userEvent.click( screen.getByRole( 'button', { name: 'Change the address' } ) );
			expect( submit ).toHaveBeenLastCalledWith( { action: 'back' } );
		}
	);

	it( 'shows the supplied site and waits for Continue', async () => {
		const submit = jest.fn();
		renderStep( <SiteMigrationCheck { ...mockStepProps( { navigation: { submit } } ) } />, {
			initialEntry:
				'/site-migration-check?from=https://example.com&platform=wordpress&host=bluehost',
		} );

		expect( screen.getByRole( 'heading', { name: 'We can copy your whole site' } ) ).toBeVisible();
		expect( screen.getByText( 'A new WordPress.com site' ) ).toBeVisible();
		expect( screen.getByText( 'What we’ll copy over' ) ).toBeVisible();
		expect( screen.getByRole( 'img', { name: 'Preview of example.com' } ) ).toHaveAttribute(
			'data-url',
			'https://example.com'
		);
		expect( screen.queryByText( /will be replaced/ ) ).not.toBeInTheDocument();
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
		'shows WordPress.com actions despite a failed destination with copy eligibility %s',
		async ( copySiteEligibility ) => {
			const canCopySite = copySiteEligibility === 'eligible';
			const submit = jest.fn();
			renderStep(
				<SiteMigrationCheck
					{ ...mockStepProps( { navigation: { submit } } ) }
					copySiteEligibility={ copySiteEligibility }
					canUseAsDestination
					destinationFailed
				/>,
				{
					initialEntry:
						'/site-migration-check?from=https://cotrim.dev/&platform=wordpress&isWpcom=true',
				}
			);
			const choices = screen.getAllByRole( 'button', {
				name: /Move your external site here|Transfer your domain|Get access to your site/,
			} );
			expect( choices[ 0 ] ).toHaveTextContent( 'Move your external site here' );
			expect(
				screen.queryByText( /We couldn’t load the destination site/ )
			).not.toBeInTheDocument();
			expect(
				screen.getByRole( 'heading', { name: 'This site is already on WordPress.com' } )
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
				[ /Move your external site here/, 'use-as-destination' ],
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

	it( 'does not offer migration into a site that has not been validated as a destination', () => {
		renderStep( <SiteMigrationCheck { ...mockStepProps() } />, {
			initialEntry:
				'/site-migration-check?from=https://example.com&platform=wordpress&isWpcom=true',
		} );
		expect(
			screen.queryByRole( 'button', { name: /Move your external site here/ } )
		).not.toBeInTheDocument();
	} );

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
