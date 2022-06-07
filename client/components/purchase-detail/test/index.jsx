import { shallow } from 'enzyme';
import PurchaseDetail from '..';
import PurchaseButton from '../purchase-button';
import TipInfo from '../tip-info';

const noop = () => {};

describe( 'PurchaseDetail', () => {
	let wrapper;

	test( 'should be a placeholder if in need', () => {
		wrapper = shallow( <PurchaseDetail /> );
		expect( wrapper.hasClass( 'is-placeholder' ) ).toBe( false );

		wrapper = shallow( <PurchaseDetail isPlaceholder={ true } /> );
		expect( wrapper.hasClass( 'is-placeholder' ) ).toBe( true );
	} );

	test( 'should render given title and description', () => {
		wrapper = shallow( <PurchaseDetail title="test:title" description="test:description" /> );
		expect( wrapper.find( '.purchase-detail__title' ).props().children ).toEqual( 'test:title' );
		expect( wrapper.find( '.purchase-detail__description' ).props().children ).toEqual(
			'test:description'
		);
	} );

	test( 'should render given notice text', () => {
		wrapper = shallow( <PurchaseDetail requiredText="test:notice" /> );

		const notice = wrapper.find( '.purchase-detail__required-notice > em' );
		expect( notice ).toHaveLength( 1 );
		expect( notice.props().children ).toEqual( 'test:notice' );
	} );

	test( 'should render given body text', () => {
		wrapper = shallow( <PurchaseDetail body="test:body" /> );

		const body = wrapper.find( '.purchase-detail__body' );
		expect( body ).toHaveLength( 1 );
		expect( body.props().children ).toEqual( 'test:body' );
	} );

	test( 'should render a <TipInfo /> with given tip info unless the body text is passed', () => {
		wrapper = shallow( <PurchaseDetail info="test:tip-info" /> );

		const tipInfo = wrapper.find( TipInfo );
		expect( tipInfo ).toHaveLength( 1 );
		expect( tipInfo.prop( 'info' ) ).toEqual( 'test:tip-info' );

		wrapper = shallow( <PurchaseDetail info="test:tip-info" body="test:body" /> );
		expect( wrapper.find( TipInfo ) ).toHaveLength( 0 );
	} );

	test( 'should render a <PurchaseButton> with given info unless the body text is passed', () => {
		const buttonProps = {
			isSubmitting: false,
			href: 'https://wordpress.com/test/url',
			onClick: noop,
			target: 'test:target',
			rel: 'test:rel',
			buttonText: 'test:button-text',
		};

		wrapper = shallow( <PurchaseDetail { ...buttonProps } /> );

		const purchaseButton = wrapper.find( PurchaseButton );
		expect( purchaseButton ).toHaveLength( 1 );
		expect( purchaseButton.prop( 'disabled' ) ).toBe( false );
		expect( purchaseButton.prop( 'href' ) ).toEqual( 'https://wordpress.com/test/url' );
		expect( purchaseButton.prop( 'onClick' ) ).toEqual( noop );
		expect( purchaseButton.prop( 'target' ) ).toEqual( 'test:target' );
		expect( purchaseButton.prop( 'rel' ) ).toEqual( 'test:rel' );
		expect( purchaseButton.prop( 'text' ) ).toEqual( buttonProps.buttonText );

		wrapper = shallow( <PurchaseDetail { ...buttonProps } body="test:body" /> );
		expect( wrapper.find( PurchaseButton ) ).toHaveLength( 0 );
	} );
} );
