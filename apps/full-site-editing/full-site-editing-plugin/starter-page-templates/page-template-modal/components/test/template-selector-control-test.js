/**
 * External dependencies
 */
import { uniqueId } from 'lodash';
import { shallow } from 'enzyme';
import { TemplateSelectorControl } from '../template-selector-control';

describe( 'TemplateSelectorControl', () => {
	const siteInformation = {
		title: 'gutenberg-training',
		vertical: 'Business',
	};

	const templates = [
		{
			value: 'template-1',
			preview: 'https://via.placeholder.com/350x150',
			previewAlt: 'Testing alt',
		},
		{
			value: 'template-2',
			preview: 'https://via.placeholder.com/300x250',
			previewAlt: 'Testing alt 2',
		},
		{
			value: 'template-3',
			preview: 'https://via.placeholder.com/500x200',
			previewAlt: 'Testing alt 3',
		},
	];

	describe( 'Basic rendering', () => {
		it( 'renders with required props', () => {
			const wrapper = shallow(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					templates={ templates }
					siteInformation={ siteInformation }
				/>
			);

			expect( wrapper ).toMatchSnapshot();
		} );

		it( 'does not render when missing templates prop', () => {
			const wrapper = shallow(
				<TemplateSelectorControl label="Select a Template..." instanceId={ uniqueId() } />
			);

			expect( wrapper.isEmptyRender() ).toBe( true );
		} );

		it( 'does not render when templates prop is not an array', () => {
			const wrapper = shallow(
				<TemplateSelectorControl
					label="Select a Template..."
					instanceId={ uniqueId() }
					templates={ 'evil stuff here' }
				/>
			);

			expect( wrapper.isEmptyRender() ).toBe( true );
		} );
	} );
} );
