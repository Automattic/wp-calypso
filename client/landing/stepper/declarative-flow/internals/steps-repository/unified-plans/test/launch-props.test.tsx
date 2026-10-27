/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import PlansStepAdaptor from '../index';

let mockReceivedProps: Record< string, unknown > = {};

jest.mock( '../unified-plans-step', () => ( {
	__esModule: true,
	default: ( props: Record< string, unknown > ) => {
		mockReceivedProps = props;
		return null;
	},
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: () => null,
} ) );

jest.mock( 'calypso/components/data/query-theme', () => ( {
	useQueryTheme: jest.fn(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-blueprint-suggested-plans', () => ( {
	useBlueprintSuggestedPlans: () => ( { suggestedPlans: [], isLoading: false } ),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-query', () => ( {
	useQuery: () => new URLSearchParams(),
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site', () => ( {
	useSite: () => null,
} ) );

jest.mock( 'calypso/landing/stepper/hooks/use-site-slug', () => ( {
	useSiteSlug: () => 'example.wordpress.com',
} ) );

jest.mock( 'calypso/lib/plans/use-visual-split-experiment', () => ( {
	useIsVisualSplitEnabled: () => [ false, null ],
} ) );

const renderAdaptor = ( extraProps: Record< string, unknown > = {} ) => {
	const props = {
		flow: 'launch-site',
		stepName: 'plans',
		navigation: { submit: jest.fn(), goBack: jest.fn() },
		...extraProps,
	} as unknown as Parameters< typeof PlansStepAdaptor >[ 0 ];

	return render(
		<MemoryRouter>
			<PlansStepAdaptor { ...props } />
		</MemoryRouter>
	);
};

describe( 'PlansStepAdaptor launch props', () => {
	beforeEach( () => {
		mockReceivedProps = {};
	} );

	it( 'forwards the launch page props to the plans grid', () => {
		renderAdaptor( {
			isLaunchPage: true,
			isCustomDomainAllowedOnFreePlan: true,
			deemphasizeFreePlan: true,
		} );

		expect( mockReceivedProps ).toEqual(
			expect.objectContaining( {
				isLaunchPage: true,
				isCustomDomainAllowedOnFreePlan: true,
				deemphasizeFreePlan: true,
			} )
		);
	} );
} );
