/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import RenderSwitch from 'calypso/components/jetpack/render-switch';

const Loading = <div data-testid="loading" />;
const Query = <div data-testid="query" />;
const TrueComponent = <div data-testid="true" />;
const FalseComponent = <div data-testid="false" />;

describe( 'RenderSwitch', () => {
	test( 'if loadingCondition is true, renders the loading and query components', () => {
		render(
			<RenderSwitch
				loadingCondition={ () => true }
				loadingComponent={ Loading }
				queryComponent={ Query }
			/>
		);

		expect( screen.queryByTestId( 'query' ) ).toBeVisible();
		expect( screen.queryByTestId( 'loading' ) ).toBeVisible();
	} );

	test( 'if loadingCondition is true but loadingComponent is undefined, skip rendering it', () => {
		render( <RenderSwitch loadingCondition={ () => true } queryComponent={ Query } /> );
		expect( screen.queryByTestId( 'query' ) ).toBeVisible();
	} );

	test( 'if loadingCondition is true but queryComponent is undefined, skip rendering it', () => {
		render( <RenderSwitch loadingCondition={ () => true } loadingComponent={ Loading } /> );
		expect( screen.queryByTestId( 'loading' ) ).toBeVisible();
	} );

	test( 'if loadingCondition is false and renderCondition is true, renders only trueComponent', () => {
		render(
			<RenderSwitch
				loadingCondition={ () => false }
				renderCondition={ () => true }
				trueComponent={ TrueComponent }
				falseComponent={ FalseComponent }
			/>
		);

		expect( screen.queryByTestId( 'true' ) ).toBeVisible();
		expect( screen.queryByTestId( 'false' ) ).not.toBeInTheDocument();
	} );

	test( 'if loadingCondition is false and renderCondition is false, renders only falseComponent', () => {
		render(
			<RenderSwitch
				loadingCondition={ () => false }
				renderCondition={ () => false }
				trueComponent={ TrueComponent }
				falseComponent={ FalseComponent }
			/>
		);

		expect( screen.queryByTestId( 'true' ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'false' ) ).toBeVisible();
	} );

	test( 'if trueComponent should render but is undefined, return null', () => {
		const { container } = render(
			<RenderSwitch loadingCondition={ () => false } renderCondition={ () => true } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'if falseComponent should render but is undefined, return null', () => {
		const { container } = render(
			<RenderSwitch loadingCondition={ () => false } renderCondition={ () => false } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );
} );
