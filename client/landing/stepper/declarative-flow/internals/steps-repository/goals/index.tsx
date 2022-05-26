import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import SelectCard from './select-card';
import type { Step } from '../../types';
import './style.scss';

/**
 * The goals capture step
 */
const GoalsStep: Step = ( { navigation } ) => {
	const { goNext } = navigation;
	const translate = useTranslate();
	const headerText = translate( 'Welcome! What are your goals?' );
	const subHeaderText = translate( 'Tell us what would you like to accomplish with your website.' );

	// Mock step content
	const [ selected, setSelected ] = useState( false );
	const toggleSelected = () => {
		setSelected( ! selected );
	};
	const stepContent = (
		<SelectCard selected={ selected } value="build" onChange={ toggleSelected }>
			Promote myself or my business
		</SelectCard>
	);

	return (
		<StepContainer
			stepName={ 'goals-step' }
			goNext={ goNext }
			skipLabelText={ translate( 'Skip to Dashboard' ) }
			skipButtonAlign={ 'top' }
			hideBack={ true }
			isHorizontalLayout={ false }
			className={ 'goals__container' }
			formattedHeader={
				<FormattedHeader
					id={ 'goals-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default GoalsStep;
