import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import UnifiedDesignPicker from './unified-design-picker';
import type { Step } from '../../types';
import type { Design } from '@automattic/design-picker';

/**
 * The design picker step
 */
const DesignSetup: Step< {
	submits: {
		selectedDesign?: Design;
		eventProps: {
			is_filter_included_with_plan_enabled: boolean;
			is_big_sky_eligible: boolean;
			preselected_filters: string;
			selected_filters: string;
		};
	};
} > = ( props ) => {
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
