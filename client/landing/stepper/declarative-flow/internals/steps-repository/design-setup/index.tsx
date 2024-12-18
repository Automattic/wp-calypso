import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import UnifiedDesignPicker from './unified-design-picker';
import type { Step } from '../../types';

/**
 * The design picker step
 */
const DesignSetup: Step = ( props ) => {
	const translate = useTranslate();
	const hasEnTranslation = useHasEnTranslation();

	const headerText = hasEnTranslation( 'Pick a theme' )
		? translate( 'Pick a theme' )
		: translate( 'Pick a design' );

	return (
		<>
			<DocumentHead title={ headerText } />
			<UnifiedDesignPicker { ...props } />
		</>
	);
};

export default DesignSetup;
