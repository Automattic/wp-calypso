/**
 * @jest-environment jsdom
 */
import { shallow } from 'enzyme';
import { SeoSettingsHelpCard } from '../help';

const props = {
	disabled: false,
	siteId: 1,
	translate: ( x ) => x,
};

describe( 'SeoSettingsHelpCard basic tests', () => {
	test( 'should render SEO help card when has advanced seo', () => {
		const comp = shallow( <SeoSettingsHelpCard { ...props } hasAdvancedSEOFeature={ true } /> );
		expect( comp.find( '.seo-settings__help' ) ).toHaveLength( 1 );
	} );

	test( 'should not render SEO help card when does not have advanced seo', () => {
		const comp = shallow( <SeoSettingsHelpCard { ...props } hasAdvancedSEOFeature={ false } /> );
		expect( comp.find( '.seo-settings__help' ) ).toHaveLength( 0 );
	} );
} );
