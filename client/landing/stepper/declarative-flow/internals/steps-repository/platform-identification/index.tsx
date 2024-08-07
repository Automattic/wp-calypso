import { useTranslate } from 'i18n-calypso';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import ImportList from '../import-list';

const PlatformIdentificationStep: Step = ( props ) => {
	const translate = useTranslate();

	return (
		<ImportList
			title={ translate( 'Another title' ) }
			subTitle={ translate( 'Another subtitle' ) }
			skipTracking
			{ ...props }
		/>
	);
};

export default PlatformIdentificationStep;
