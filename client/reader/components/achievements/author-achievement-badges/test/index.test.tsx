/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { AuthorAchievementBadges } from '../index';

jest.mock( 'calypso/reader/components/achievements/use-achievements-visibility' );
jest.mock( 'calypso/data/reader/use-achievements-query' );

jest.mock( 'calypso/reader/components/achievements/years-of-service-badge', () => ( {
	YearsOfServiceBadge: ( { yearsOfService }: { yearsOfService: number } ) => (
		<div data-testid="years-of-service-badge">{ yearsOfService }</div>
	),
} ) );

// eslint-disable-next-line @typescript-eslint/no-var-requires
const useAchievementsVisibility =
	require( 'calypso/reader/components/achievements/use-achievements-visibility' )
		.default as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { useAchievementsQuery } = require( 'calypso/data/reader/use-achievements-query' ) as {
	useAchievementsQuery: jest.Mock;
};

describe( 'AuthorAchievementBadges', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		useAchievementsVisibility.mockReturnValue( {
			isOwnProfile: false,
			isVisible: true,
			isLoading: false,
		} );
		useAchievementsQuery.mockReturnValue( { yearsOfService: undefined, isLoading: false } );
	} );

	test( 'should render nothing when achievements are not visible', () => {
		useAchievementsVisibility.mockReturnValue( {
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
		useAchievementsQuery.mockReturnValue( { yearsOfService: undefined, isLoading: false } );

		const { container } = render(
			<AuthorAchievementBadges authorLogin="testuser" size="medium" />
		);

		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'should render nothing when years of service is 0', () => {
		useAchievementsQuery.mockReturnValue( { yearsOfService: 0, isLoading: false } );

		const { container } = render( <AuthorAchievementBadges authorLogin="testuser" size="small" /> );

		expect( container.innerHTML ).toBe( '' );
	} );

	test( 'should render YearsOfServiceBadge when visible and YOS > 0', () => {
		useAchievementsQuery.mockReturnValue( { yearsOfService: 5, isLoading: false } );

		render( <AuthorAchievementBadges authorLogin="testuser" size="medium" /> );

		expect( screen.getByTestId( 'years-of-service-badge' ) ).toBeVisible();
		expect( screen.getByText( '5' ) ).toBeVisible();
	} );

	test( 'should render badges inside a container span', () => {
		useAchievementsQuery.mockReturnValue( { yearsOfService: 3, isLoading: false } );

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
