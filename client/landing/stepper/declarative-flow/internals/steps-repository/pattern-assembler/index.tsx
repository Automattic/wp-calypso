import { StepContainer } from '@automattic/onboarding';
import AsyncLoad from 'calypso/components/async-load';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import type { Step } from '../../types';

const PatternAssembler: Step = ( { navigation } ) => {
	const { goNext, goBack } = navigation;
	const site = useSite();

	return (
		<StepContainer
			stepName={ 'pattern-assembler' }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			hideSkip={ true }
			stepContent={ <AsyncLoad require="@automattic/block-preview" siteId={ site?.ID } /> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default PatternAssembler;
