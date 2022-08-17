import { useTranslate } from 'i18n-calypso';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import PromoteStep from './promote';
import type { Step } from '../../types';
import './style.scss';

const Promote: Step = function Promote( { navigation, flow } ) {
	const { goNext, goBack } = navigation;
	const translate = useTranslate();
	const headerText = translate( 'Promote post' );

	const handleGetStarted = () => {
		// needs to be implemented
		goNext();
	};

	return (
		<StepContainer
			stepName={ 'promote' }
			goBack={ goBack }
			isHorizontalLayout={ false }
			formattedHeader={ <FormattedHeader headerText={ headerText } align={ 'center' } /> }
			stepContent={ <PromoteStep flowName={ flow } goNext={ handleGetStarted } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default Promote;
