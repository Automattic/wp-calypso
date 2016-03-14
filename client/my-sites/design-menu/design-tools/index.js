/**
 * Internal dependencies
 */
import { translate } from 'lib/mixins/i18n';
import SiteTitleControl from 'tailor/controls/site-title-control';
import HeaderImageControl from 'tailor/controls/header-image-control';
import ControlList from 'tailor/control-list';

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
