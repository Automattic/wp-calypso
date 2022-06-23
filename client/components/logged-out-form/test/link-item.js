/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import LoggedOutFormLinkItem from '../link-item';

describe( 'LoggedOutFormLinkItem', () => {
	test( 'should render an <a> element', () => {
		render(
			<LoggedOutFormLinkItem href="http://example.com">Example text here</LoggedOutFormLinkItem>
		);
		expect( screen.queryByRole( 'link' ) ).toHaveAttribute( 'href', 'http://example.com' );
		expect( screen.queryByRole( 'link' ) ).toHaveTextContent( 'Example text here' );
	} );

	test( 'should include own class and append passed class', () => {
		const testClass = 'test-classname';
		const { container } = render( <LoggedOutFormLinkItem className={ testClass } /> );

		expect( container.firstChild ).toHaveClass( 'test-classname' );
	} );
} );
