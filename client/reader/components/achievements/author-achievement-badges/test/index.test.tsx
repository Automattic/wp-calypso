/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { useAchievementsQuery } from 'calypso/data/reader/use-achievements-query';
import useAchievementsVisibility from 'calypso/reader/components/achievements/use-achievements-visibility';
import { AuthorAchievementBadges } from '../index';

vi.mock( 'calypso/reader/components/achievements/use-achievements-visibility' );
vi.mock( 'calypso/data/reader/use-achievements-query' );

vi.mock( 'calypso/reader/components/achievements/years-of-service-badge', () => ( {
	YearsOfServiceBadge: ( { yearsOfService }: { yearsOfService: number } ) => (
		<div data-testid="years-of-service-badge">{ yearsOfService }</div>
	),
} ) );

describe( 'AuthorAchievementBadges', () => {
	beforeEach( () => {
		vi.clearAllMocks();
		( useAchievementsVisibility as Mock ).mockReturnValue( {
			isOwnProfile: false,
			isVisible: true,
			isLoading: false,
		} );
		( useAchievementsQuery as Mock ).mockReturnValue( {
			yearsOfService: undefined,
			isLoading: false,
		} );
	} );

	test( 'should render nothing when achievements are not visible', () => {
		( useAchievementsVisibility as Mock ).mockReturnValue( {
			isOwnProfile: false,
			isVisible: false,
			isLoading: false,
		} );

		const { container } = render(
			<AuthorAchievementBadges authorLogin="testuser" size="medium" />
		);

		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'should render nothing when there are no badges to show', () => {
		( useAchievementsQuery as Mock ).mockReturnValue( {
			yearsOfService: undefined,
			isLoading: false,
		} );

		const { container } = render(
			<AuthorAchievementBadges authorLogin="testuser" size="medium" />
		);

		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'should render nothing when years of service is 0', () => {
		( useAchievementsQuery as Mock ).mockReturnValue( { yearsOfService: 0, isLoading: false } );

		const { container } = render( <AuthorAchievementBadges authorLogin="testuser" size="small" /> );

		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'should render YearsOfServiceBadge when visible and YOS > 0', () => {
		( useAchievementsQuery as Mock ).mockReturnValue( { yearsOfService: 5, isLoading: false } );

		render( <AuthorAchievementBadges authorLogin="testuser" size="medium" /> );

		expect( screen.getByTestId( 'years-of-service-badge' ) ).toBeVisible();
		expect( screen.getByText( '5' ) ).toBeVisible();
	} );

	test( 'should render badges inside a container span', () => {
		( useAchievementsQuery as Mock ).mockReturnValue( { yearsOfService: 3, isLoading: false } );

		const { container } = render( <AuthorAchievementBadges authorLogin="testuser" size="small" /> );

		expect( container.querySelector( '.author-achievement-badges' ) ).toBeInTheDocument();
	} );

	test( 'should render nothing when authorLogin is undefined', () => {
		const { container } = render(
			<AuthorAchievementBadges authorLogin={ undefined } size="small" />
		);

		expect( container.innerHTML ).toBe( '' );
	} );
} );
