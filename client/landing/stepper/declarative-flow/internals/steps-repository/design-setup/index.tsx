import AnchorFmDesignPicker from './anchor-fm-design-picker';
import UnifiedDesignPicker from './unified-design-picker';
import type { Step } from '../../types';

/**
 * The design picker step
 */
const DesignSetup: Step = ( props ) => {
	if ( 'anchor-fm' === props.flow ) {
		return <AnchorFmDesignPicker { ...props } />;
	}
	return <UnifiedDesignPicker { ...props } />;
};

export default DesignSetup;
