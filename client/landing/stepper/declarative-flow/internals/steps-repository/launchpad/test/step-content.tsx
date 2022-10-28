/**
 * @jest-environment jsdom
 */
import StepContent from '../step-content';
import { render } from 'enzyme';
import EmailValidationBanner from '../email-validation-banner';
import { createReduxStore } from 'calypso/state';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';

const props = {
	siteSlug: 'sharpiratenewsletters.wordpress.com',
	submit: () => {},
	goNext: () => {},
	goToStep: () => {},
};

const emailValidationBannerProps = {
	email: 'testemail@wordpress.com',
	closeBanner: () => {},
};

jest.mock( 'react-router-dom', () => ( {
	...jest.requireActual( 'react-router-dom' ),
	useLocation: jest.fn().mockImplementation( () => ( {
		pathname: '/setup/launchpad',
		search: '?flow=newsletter&siteSlug=sharpiratenewsletters.wordpress.com',
		hash: '',
		state: undefined,
	} ) ),
} ) );

function renderStepContent() {
	const store = createReduxStore();
	const queryClient = new QueryClient();

	render(
		<ReduxProvider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<StepContent { ...props }>
					<EmailValidationBanner { ...emailValidationBannerProps } />
				</StepContent>
			</QueryClientProvider>
		</ReduxProvider>
	);
}

describe( 'EmailValidationBanner', () => {
	it( 'test', () => {
		renderStepContent();
		expect( true ).toBe( true );
	} );
} );
