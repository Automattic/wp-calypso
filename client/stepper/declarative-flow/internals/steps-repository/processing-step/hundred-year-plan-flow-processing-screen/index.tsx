import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import HundredYearLoaderView from 'calypso/components/hundred-year-loader-view';

export default function HundredYearPlanFlowProcessingScreen() {
	const translate = useTranslate();
	const isMobile = useMobileBreakpoint();

	return (
		<HundredYearLoaderView
			isMobile={ isMobile }
			loadingText={ translate( 'Setting up your legacy…' ) }
		/>
	);
}
