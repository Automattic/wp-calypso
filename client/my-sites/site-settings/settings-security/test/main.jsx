import { PLAN_FREE } from '@automattic/calypso-products';
import { shallow } from 'enzyme';
import { SiteSettingsSecurity } from '../main';

const props = {
	site: {
		plan: PLAN_FREE,
	},
	translate: ( x ) => x,
};

describe( 'SiteSettingsSecurity basic tests', () => {
	test( 'error page should not show if active security settings feature', () => {
		const comp = shallow(
			<SiteSettingsSecurity { ...props } hasActiveSecuritySettingsFeature={ true } />
		);
		expect( comp.find( 'EmptyContent' ) ).toHaveLength( 0 );
	} );
	test( 'error page should show if no active security settings feature', () => {
		const comp = shallow(
			<SiteSettingsSecurity { ...props } hasActiveSecuritySettingsFeature={ false } />
		);
		expect( comp.find( 'EmptyContent' ) ).toHaveLength( 1 );
	} );
} );
