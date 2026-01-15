import { renderToStaticMarkup } from 'react-dom/server';
import LoginContextProvider, { useLoginContext } from '../login-context';

const TestConsumer = () => {
	const { headingText, subHeadingText } = useLoginContext();

	return (
		<div>
			<span data-testid="heading">{ headingText }</span>
			<span data-testid="subheading">{ subHeadingText }</span>
		</div>
	);
};

describe( 'LoginContextProvider (SSR)', () => {
	test( 'renders initial headings without relying on effects', () => {
		const html = renderToStaticMarkup(
			<LoginContextProvider initialHeading="Hello" initialSubHeading="World">
				<TestConsumer />
			</LoginContextProvider>
		);

		expect( html ).toContain( 'Hello' );
		expect( html ).toContain( 'World' );
	} );
} );
