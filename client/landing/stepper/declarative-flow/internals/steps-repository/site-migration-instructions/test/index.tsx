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
	it.each( [
		{ hostingName: 'WP Engine', isUnknown: false, isA8c: false, expected: true },
		{ hostingName: 'WordPress.com', isUnknown: false, isA8c: true, expected: false },
		{ hostingName: 'Unknown', isUnknown: true, isA8c: false, expected: false },
	] )(
		'renders the hosting badge only when the hosting is known and not A8C',
		async ( { hostingName, isUnknown, isA8c, expected } ) => {
			useHostingProviderUrlDetails.mockReturnValue( {
				data: {
					name: hostingName,
					is_unknown: isUnknown,
					is_a8c: isA8c,
				},
			} );

			const { queryByText } = render();

			const maybeExpect = ( arg, exp ) => ( exp ? expect( arg ) : expect( arg ).not );
			maybeExpect( queryByText( `Hosted with ${ hostingName }` ), expected ).toBeInTheDocument();
		}
	);
} );
