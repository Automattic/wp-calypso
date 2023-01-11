import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import AnchorFmDesignPicker from './anchor-fm-design-picker';
import UnifiedDesignPicker from './unified-design-picker';
import type { Step } from '../../types';

/**
 * The design picker step
 */
const DesignSetup: Step = ( props ) => {
	const translate = useTranslate();

	const headerText = translate( 'Pick a design' );

	if ( 'anchor-fm' === props.flow ) {
		return (
			<>
				<DocumentHead title={ headerText } />
				<AnchorFmDesignPicker { ...props } />
			</>
		);
	}
	return (
		<>
			<DocumentHead title={ headerText } />
			<UnifiedDesignPicker { ...props } />
		</>
	);
};

export default DesignSetup;
