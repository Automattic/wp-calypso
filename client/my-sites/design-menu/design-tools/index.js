/**
 * Internal dependencies
 */
import { translate } from 'lib/mixins/i18n';
import SiteTitleControl from './site-title-control';
import HeaderImageControl from './header-image-control';
import ControlList from './control-list';

const designToolsById = {
	default: {
		title: translate( 'Customizing' ),
		componentClass: ControlList,
	},
	siteTitle: {
		title: translate( 'Site Title, Tagline, and Logo' ),
		componentClass: SiteTitleControl,
	},
	headerImage: {
		title: translate( 'Header Image' ),
		componentClass: HeaderImageControl,
	},
};

export default designToolsById;
