import { useTranslate } from 'i18n-calypso';
import { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';
import ImportList from '../import-list';

const PlatformIdentificationStep: Step = ( props ) => {
	const translate = useTranslate();

	return (
		<ImportList
			title={ translate( 'Move your site to WordPress.com' ) }
			subTitle={ translate( ' ' ) }
			skipTracking
			{ ...props }
		/>
	);
};

export default PlatformIdentificationStep;
