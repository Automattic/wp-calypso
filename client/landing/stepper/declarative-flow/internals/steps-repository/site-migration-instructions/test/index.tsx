/**
 * @jest-environment jsdom
 */
import { useHostingProviderUrlDetails } from 'calypso/data/site-profiler/use-hosting-provider-url-details';
import SiteMigrationInstructions from '..';
import { StepProps } from '../../../types';
import { renderStep, mockStepProps } from '../../test/helpers';

const render = ( props?: Partial< StepProps > ) => {
	const combinedProps = { ...mockStepProps( props ) };
	return renderStep( <SiteMigrationInstructions { ...combinedProps } /> );
};

jest.mock( 'calypso/data/site-profiler/use-hosting-provider-url-details' );

describe( 'SiteMigrationInstructions', () => {
	it( 'shows the hosting badge when the host is known and not a8c', async () => {
		useHostingProviderUrlDetails.mockReturnValue( {
			data: {
				name: 'WP Engine',
				is_unknown: false,
				is_a8c: false,
			},
		} );

		const { container, queryByText } = render();

		expect( container.querySelectorAll( '.migration-instructions-hosting-badge' ) ).toHaveLength(
			1
		);
		expect( queryByText( /WP Engine/ ) ).toBeInTheDocument();
	} );

	it( "doesn't show the hosting badge when the host is a8c", async () => {
		useHostingProviderUrlDetails.mockReturnValue( {
			data: {
				name: 'WordPress.com',
				is_unknown: false,
				is_a8c: true,
			},
		} );

		const { container, queryByText } = render();

		expect( container.querySelectorAll( '.migration-instructions-hosting-badge' ) ).toHaveLength(
			0
		);
		expect( queryByText( /WordPress.com/ ) ).not.toBeInTheDocument();
	} );

	it( "doesn't show the hosting badge when the host is unknown", async () => {
		useHostingProviderUrlDetails.mockReturnValue( {
			data: {
				name: 'unknown',
				is_unknown: true,
				is_a8c: false,
			},
		} );

		const { container, queryByText } = render();

		expect( container.querySelectorAll( '.migration-instructions-hosting-badge' ) ).toHaveLength(
			0
		);
		expect( queryByText( /unknown/ ) ).not.toBeInTheDocument();
	} );
} );
