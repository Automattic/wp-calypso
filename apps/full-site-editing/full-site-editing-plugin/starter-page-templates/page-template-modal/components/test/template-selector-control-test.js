/**
 * External dependencies
 */
import { uniqueId } from 'lodash';
import { shallow } from 'enzyme';
import { templatesFixture, blocksByTemplatesFixture } from './helpers/templates-blocks-helpers';
import { TemplateSelectorControl } from '../template-selector-control';

describe( 'TemplateSelectorControl', () => {
	const siteInformation = {
		title: 'gutenberg-training',
		vertical: 'Business',
	};

	describe( 'Basic rendering', () => {
		it( 'renders with required props', () => {
			const wrapper = shallow(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					templates={ templatesFixture }
					blocksByTemplates={ blocksByTemplatesFixture }
					siteInformation={ siteInformation }
				/>
			);
			expect( wrapper.isEmptyRender() ).toBe( false );
			expect( wrapper ).toMatchSnapshot();
		} );

		it( 'does not render when missing templates prop', () => {
			const wrapper = shallow(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					blocksByTemplates={ blocksByTemplatesFixture }
				/>
			);

			expect( wrapper.isEmptyRender() ).toBe( true );
		} );

		it( 'does not render when templates prop is not an Array', () => {
			const wrapper = shallow(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					templates={ 'evil stuff here' }
					blocksByTemplates={ blocksByTemplatesFixture }
				/>
			);

			expect( wrapper.isEmptyRender() ).toBe( true );
		} );
	} );
} );
