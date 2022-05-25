/** @jest-environment jsdom */
import { shallow } from 'enzyme';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import PluginsBrowserListElement from '../';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {} ) );
jest.mock( 'calypso/lib/analytics/page-view', () => ( {} ) );
jest.mock( 'calypso/state/ui/selectors' );
jest.mock( 'calypso/state/plugins/installed/selectors' );
jest.mock( 'calypso/state/products-list/selectors' );
jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/selectors/is-site-automated-transfer' );
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useDispatch: jest.fn().mockImplementation( () => {} ),
	useSelector: jest.fn().mockImplementation( ( selector ) => selector() ),
} ) );

describe( 'PluginsBrowserItem Incompatible Plugins Message', () => {
	test( 'should render the incompatible plugin message on Simple Sites', () => {
		isJetpackSite.mockImplementation( () => false );
		isAtomicSite.mockImplementation( () => false );

		const props = {
			plugin: { name: 'wordfence', slug: 'wordfence' },
		};

		const comp = shallow( <PluginsBrowserListElement { ...props } /> );
		expect( comp.text().includes( 'Why is this plugin not compatible with WordPress.com?' ) ).toBe(
			true
		);
	} );

	test( 'should render the incompatible plugin message on Atomic Sites', () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => true );

		const props = {
			plugin: { name: 'wordfence', slug: 'wordfence' },
		};

		const comp = shallow( <PluginsBrowserListElement { ...props } /> );
		expect( comp.text().includes( 'Why is this plugin not compatible with WordPress.com?' ) ).toBe(
			true
		);
	} );

	test( 'should NOT render the incompatible plugin message on JetpackSite non Atomic sites', () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => false );

		const props = {
			plugin: { name: 'wordfence', slug: 'wordfence' },
		};

		const comp = shallow( <PluginsBrowserListElement { ...props } /> );
		expect( comp.text().includes( 'Why is this plugin not compatible with WordPress.com?' ) ).toBe(
			false
		);
	} );

	test( 'should NOT render the incompatible plugin message if it is not in the list', () => {
		isJetpackSite.mockImplementation( () => true );
		isAtomicSite.mockImplementation( () => false );

		const props = {
			plugin: { name: 'woocommerce', slug: 'woocommerce' },
		};

		const comp = shallow( <PluginsBrowserListElement { ...props } /> );
		expect( comp.text().includes( 'Why is this plugin not compatible with WordPress.com?' ) ).toBe(
			false
		);
	} );
} );
