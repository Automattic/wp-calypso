import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkipSuggestion } from '..';
import { buildFreeSuggestion } from '../../../test-helpers/factories/suggestions';
import { mockGetFreeSuggestionQuery } from '../../../test-helpers/queries/suggestions';
import { TestDomainSearch, TestDomainSearchWithSuggestions } from '../../../test-helpers/renderer';
import { MockMutation } from '../../../test-helpers/utils';

describe( 'SkipSuggestion', () => {
	describe( 'continue with existing site if current site url is provided', () => {
		it( 'allows skipping the step', async () => {
			const onSkip = jest.fn();

			render(
				<TestDomainSearch
					currentSiteUrl="test.com"
					config={ { skippable: true } }
					events={ { onSkip } }
				>
					<SkipSuggestion />
				</TestDomainSearch>
			);

			expect( screen.getByText( 'Current address' ) ).toBeInTheDocument();
			expect( screen.getByText( /Keep/ ) ).toHaveTextContent(
				'Keep test.com as your site address'
			);

			const skipButton = screen.getByRole( 'button', {
				name: 'Skip purchase and continue with test.com',
			} );

			expect( skipButton ).toBeInTheDocument();

			await userEvent.click( skipButton );

			expect( onSkip ).toHaveBeenCalledWith();
		} );

		it( 'disables the button when a mutation is in progress', async () => {
			const onSkip = jest.fn();

			const mutation = Promise.withResolvers< void >();

			render(
				<TestDomainSearch
					currentSiteUrl="test.com"
					config={ { skippable: true } }
					events={ { onSkip } }
				>
					<MockMutation mutationPromise={ mutation.promise } />
					<SkipSuggestion />
				</TestDomainSearch>
			);

			await userEvent.click( await screen.findByRole( 'button', { name: 'Click me' } ) );

			const skipButton = screen.getByRole( 'button', {
				name: 'Skip purchase and continue with test.com',
			} );

			expect( skipButton ).toBeDisabled();

			mutation.resolve();

			await waitFor( () => {
				expect( skipButton ).not.toBeDisabled();
			} );
		} );
	} );

	describe( 'skip with free suggestion if no current site url is provided', () => {
		it( 'allows skipping the step', async () => {
			const onSkip = jest.fn();

			const freeSuggestion = buildFreeSuggestion( { domain_name: 'site.wordpress.com' } );

			mockGetFreeSuggestionQuery( {
				params: { query: 'site' },
				freeSuggestion,
			} );

			render(
				<TestDomainSearchWithSuggestions
					query="site"
					config={ { skippable: true } }
					events={ { onSkip } }
				>
					<SkipSuggestion />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( 'WordPress.com subdomain' ) ).toBeInTheDocument();
			expect( screen.getByText( /is included/ ) ).toHaveTextContent(
				'site.wordpress.com is included'
			);

			const skipButton = screen.getByRole( 'button', {
				name: 'Skip purchase and continue with site.wordpress.com',
			} );
			expect( skipButton ).toBeInTheDocument();

			await userEvent.click( skipButton );

			expect( onSkip ).toHaveBeenCalledWith( freeSuggestion );
		} );

		it( 'includes .blog suggestions when the config allows it', async () => {
			const freeSuggestion = buildFreeSuggestion( { domain_name: 'site.blog' } );

			const freeSuggestionQuery = mockGetFreeSuggestionQuery( {
				params: { query: 'site', include_dotblogsubdomain: true },
				freeSuggestion,
			} );

			render(
				<TestDomainSearchWithSuggestions
					query="site"
					config={ { skippable: true, includeDotBlogSubdomain: true } }
				>
					<SkipSuggestion />
				</TestDomainSearchWithSuggestions>
			);

			expect( await screen.findByText( /is included/ ) ).toHaveTextContent(
				'site.blog is included'
			);

			expect( freeSuggestionQuery.isDone() ).toBe( true );
		} );

		it( 'disables the button when a mutation is in progress', async () => {
			const onSkip = jest.fn();

			const mutation = Promise.withResolvers< void >();

			const freeSuggestion = buildFreeSuggestion( { domain_name: 'site.wordpress.com' } );

			mockGetFreeSuggestionQuery( {
				params: { query: 'site' },
				freeSuggestion,
			} );

			render(
				<TestDomainSearchWithSuggestions
					query="site"
					config={ { skippable: true } }
					events={ { onSkip } }
				>
					<MockMutation mutationPromise={ mutation.promise } />
					<SkipSuggestion />
				</TestDomainSearchWithSuggestions>
			);

			await userEvent.click( await screen.findByRole( 'button', { name: 'Click me' } ) );

			const skipButton = screen.getByRole( 'button', {
				name: 'Skip purchase and continue with site.wordpress.com',
			} );

			expect( skipButton ).toBeDisabled();

			mutation.resolve();

			await waitFor( () => {
				expect( skipButton ).not.toBeDisabled();
			} );
		} );
	} );
} );
