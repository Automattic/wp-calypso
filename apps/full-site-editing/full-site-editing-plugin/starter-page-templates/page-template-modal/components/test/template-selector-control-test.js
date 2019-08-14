/**
 * External dependencies
 */
import { uniqueId } from 'lodash';
import { shallow } from 'enzyme';
import { TemplateSelectorControl } from '../template-selector-control';

describe( 'TemplateSelectorControl', () => {
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

	it( 'calls onClick prop on button click with correct button value', () => {
		const onClickSpy = jest.fn();

		const wrapper = shallow(
			<TemplateSelectorControl
				label="Select a Template..."
				instanceId={ uniqueId() }
				templates={ templates }
				onClick={ onClickSpy }
			/>
		);

		const firstButton = wrapper.find( '.template-selector-control__option button' ).first();
		const firstButtonValue = firstButton.prop( 'value' );

		// We are required to provide a mock event.
		// see https://airbnb.io/enzyme/docs/api/ShallowWrapper/simulate.html.
		firstButton.simulate( 'click', {
			target: {
				value: firstButtonValue,
			},
		} );

		expect( onClickSpy ).toHaveBeenCalledWith( firstButtonValue );
	} );
} );
