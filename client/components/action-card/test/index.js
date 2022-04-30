/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { shallow } from 'enzyme';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend( toHaveNoViolations );
import ActionCard from '..';

const props = {
	headerText: 'This is a header text',
	mainText:
		'This is a description of the action. It gives a bit more detail and explains what we are inviting the user to do.',
	buttonText: 'Call to action!',
	buttonIcon: 'external',
	buttonPrimary: true,
	buttonHref: 'https://wordpress.com',
	buttonTarget: '_blank',
	buttonOnClick: null,
};

describe( 'ActionCard basic tests', () => {
	test( 'should not blow up and have proper CSS class', () => {
		const comp = shallow( <ActionCard { ...props } /> );
		expect( comp.find( '.action-card' ) ).toHaveLength( 1 );
	} );

	test( 'should have basic accessibility', async () => {
		const comp = shallow( <ActionCard { ...props } /> );
		const results = await axe( comp.html() );

		expect( results ).toHaveNoViolations();
	} );
} );
