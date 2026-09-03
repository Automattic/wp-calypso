/**
 * @jest-environment jsdom
 */
import { GSUITE_BASIC_SLUG, GSUITE_BUSINESS_SLUG } from '@automattic/calypso-products';
import { render } from '@testing-library/react';
import GSuiteFeatures from '../';

describe( 'GSuiteFeatures', () => {
	test( 'it renders GSuiteFeatures with basic plan', () => {
		const { container } = render(
			<GSuiteFeatures domainName="testing123.com" productSlug={ GSUITE_BASIC_SLUG } />
		);

		expect( container.firstChild ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteFeatures with business plan', () => {
		const { container } = render(
			<GSuiteFeatures domainName="testing123.com" productSlug={ GSUITE_BUSINESS_SLUG } />
		);

		expect( container.firstChild ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteFeatures without a productSlug', () => {
		const { container } = render( <GSuiteFeatures domainName="testing123.com" /> );

		expect( container.firstChild ).toMatchSnapshot();
	} );

	test( 'it renders GSuiteFeatures in a list', () => {
		const { container } = render(
			<GSuiteFeatures domainName="testing123.com" productSlug={ GSUITE_BASIC_SLUG } type="list" />
		);

		expect( container.firstChild ).toMatchSnapshot();
	} );
} );
