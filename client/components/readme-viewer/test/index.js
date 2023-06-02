/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import ReadmeViewer from 'calypso/components/readme-viewer';

ReadmeViewer.prototype.componentDidMount = jest.fn( function () {
	this.setState( {
		readme: 'foo',
	} );
} );

describe( 'ReadmeViewer', () => {
	test( 'should render README.md when given readmeFilePath', () => {
		const { container } = render( <ReadmeViewer readmeFilePath="foo2" /> );
		expect( container.firstChild ).toHaveClass( 'readme-viewer__wrapper' );
	} );

	test( 'should not render a README.md when not given readmeFilePath', () => {
		const { container } = render( <ReadmeViewer /> );
		expect( container.firstChild ).not.toBeInTheDocument();
	} );

	test( 'should render an edit link by default', () => {
		render( <ReadmeViewer readmeFilePath="foo2" /> );
		expect( screen.queryByRole( 'link' ) ).toBeVisible();
	} );

	test( 'should not render an edit link when showEditLink is false', () => {
		render( <ReadmeViewer readmeFilePath="foo" showEditLink={ false } /> );
		expect( screen.queryByRole( 'link' ) ).not.toBeInTheDocument();
	} );
} );
