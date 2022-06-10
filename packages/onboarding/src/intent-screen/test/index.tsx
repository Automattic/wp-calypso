import { mount } from 'enzyme';
import IntentScreen from '../';
import { SelectItem } from '../../select-items';
import { SelectItemAlt } from '../../select-items-alt';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: () => false,
	__esModule: true,
	default: function config( key: string ) {
		return key;
	},
} ) );

afterEach( () => {
	jest.clearAllMocks();
} );

const icon = <svg />;
const onSelect = jest.fn();
const preventWidow = jest.fn();

const intents: SelectItem< string >[] = [
	{
		key: '1',
		title: 'Title',
		icon: icon,
		description: <p>{ 'Description' }</p>,
		value: 'value',
		actionText: 'Action Text',
	},
	{
		key: '2',
		title: 'Title',
		icon: icon,
		description: <p>{ 'Description' }</p>,
		value: 'value',
		actionText: 'Action Text',
	},
];

const intentsAlt: SelectItemAlt< string >[] = [
	{
		show: false,
		key: '1-alt',
		description: 'Description Alt',
		actionText: 'Action Text Alt',
		value: 'value-alt',
		disable: false,
		disableText: 'Disabled text',
	},
	{
		show: true,
		key: '2-alt',
		description: 'Description Alt',
		actionText: 'Action Text Alt',
		value: 'value-alt',
		disable: false,
		disableText: 'Disabled text',
	},
	{
		show: true,
		key: '3-alt',
		description: 'Description Alt',
		actionText: 'Action Text Alt',
		value: 'value-alt',
		disable: true,
		disableText: 'Disabled text',
	},
];

const wrapper = mount(
	<IntentScreen
		intents={ intents }
		intentsAlt={ intentsAlt }
		onSelect={ onSelect }
		preventWidows={ preventWidow }
	/>
);

describe( 'IntentScreen', () => {
	describe( 'SelectItem', () => {
		it( 'should have an H2 title', () => {
			expect( wrapper.find( 'h2' ) ).toHaveLength( 2 );
		} );

		it( 'should have a working button', () => {
			wrapper
				.find( 'button.select-items__item-button' )
				.forEach( ( button ) => button.simulate( 'click' ) );
			expect( onSelect.mock.calls ).toEqual( [ [ 'value' ], [ 'value' ] ] );
			expect( wrapper.find( 'button.select-items__item-button' ).first().text() ).toBe(
				'Action Text'
			);
		} );

		it( 'should have an icon', () => {
			expect( wrapper.find( '.select-items__item svg' ) ).toHaveLength( 2 );
		} );
	} );

	describe( 'SelectItemAlt', () => {
		it( 'should have a description', () => {
			expect( wrapper.find( 'p.select-items-alt__item-description' ) ).toHaveLength( 2 );
		} );

		it( 'should have a working button', () => {
			wrapper
				.find( 'button.select-items-alt__item-button' )
				.forEach( ( alt ) => alt.simulate( 'click' ) );
			expect( onSelect.mock.calls ).toEqual( [ [ 'value-alt' ] ] );
			expect( wrapper.find( 'button.select-items-alt__item-button' ).first().text() ).toBe(
				'Action Text Alt'
			);
		} );

		it( 'able to be hidden', () => {
			expect( wrapper.find( '.select-items-alt__item' ) ).toHaveLength( 2 );
		} );

		it( 'able to be disabled', () => {
			expect( wrapper.find( 'button.select-items-alt__item-button' ).last() ).toBeDisabled;
			expect( wrapper.find( '.select-items-alt__item-disabled-info' ) ).toHaveLength( 1 );
		} );
	} );
} );
