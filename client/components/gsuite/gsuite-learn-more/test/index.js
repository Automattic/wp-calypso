/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import GSuiteLearnMore from '../';

describe( 'GSuiteLearnMore', () => {
	test( 'it renders GSuiteLearnMore with no props', () => {
		const { container } = render( <GSuiteLearnMore /> );

		expect( container.firstChild ).toMatchSnapshot();
	} );
} );
