import { isEnabled } from '@automattic/calypso-config';
import AnchorFmDesignPicker from './anchor-fm-design-picker';
import NewSiteSetupDesignPicker from './new-site-setup-design-picker';
import SiteSetupDesignPicker from './site-setup-design-picker';
import type { Step } from '../../types';

/**
 * The design picker step
 */
const DesignSetup: Step = ( props ) => {
	if ( isEnabled( 'signup/theme-preview-screen' ) ) {
		return <NewSiteSetupDesignPicker { ...props } />;
	} else if ( 'anchor-fm' === props.flow ) {
		return <AnchorFmDesignPicker { ...props } />;
	}

	return <SiteSetupDesignPicker { ...props } />;
};

export default DesignSetup;
