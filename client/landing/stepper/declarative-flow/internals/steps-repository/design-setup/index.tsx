import AnchorFmDesignPicker from './anchor-fm-design-picker';
import SiteSetupDesignPicker from './site-setup-design-picker';
import type { Step } from '../../types';

/**
 * The design picker step
 */
const DesignSetup: Step = ( props ) => {
	if ( 'anchor-fm' === props.flow ) {
		return <AnchorFmDesignPicker { ...props } />;
	}

	return <SiteSetupDesignPicker { ...props } />;
};

export default DesignSetup;
