/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * Internal dependencies
 */
import { PageAttributesCheck } from '../check';

describe( 'PageAttributesCheck', () => {
	const postType = {
		supports: {
			'page-attributes': true,
		},
	};

	it( 'should not render anything if unknown page attributes and available templates support', () => {
		const wrapper = shallow( <PageAttributesCheck postType={ {} }>content</PageAttributesCheck> );

		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should not render anything if no page attributes support and no available templates exist', () => {
		const wrapper = shallow(
			<PageAttributesCheck availableTemplates={ {} } postType={ {
				data: {
					supports: {
						'page-attributes': false,
					},
				},
			} }>
				content
			</PageAttributesCheck>
		);

		expect( wrapper.type() ).toBe( null );
	} );

	it( 'should render if page attributes support is true and no available templates exist', () => {
		const wrapper = shallow( <PageAttributesCheck postType={ postType }>content</PageAttributesCheck> );

		expect( wrapper ).toHaveText( 'content' );
	} );

	it( 'should render if page attributes support is false/unknown and available templates exist', () => {
		const wrapper = shallow( <PageAttributesCheck availableTemplates={ { 'example.php': 'Example template' } } >content</PageAttributesCheck> );

		expect( wrapper ).toHaveText( 'content' );
	} );

	it( 'should render if page attributes support is true and available templates exist', () => {
		const wrapper = shallow( <PageAttributesCheck availableTemplates={ { 'example.php': 'Example template' } } postType={ postType }>content</PageAttributesCheck> );

		expect( wrapper ).toHaveText( 'content' );
	} );
} );
