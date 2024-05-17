import { useEffect } from 'react';
import difmImage from 'calypso/assets/images/difm/difm.svg';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import DIFMLanding from 'calypso/my-sites/marketing/do-it-for-me/difm-landing';
import useBranchSteps from 'calypso/signup/hooks/use-branch-steps';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useDispatch } from 'calypso/state';
import { removeSiteSlugDependency } from 'calypso/state/signup/actions';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import type { ChoiceType } from './types';

import './style.scss';

interface Props {
	goToNextStep: () => void;
	submitSignupStep: ( { stepName, wasSkipped }: { stepName: string; wasSkipped: boolean } ) => void;
	goToStep: ( stepName: string ) => void;
	flowName: string;
	stepName: string;
	existingSiteCount: number;
}

export default function NewOrExistingSiteStep( props: Props ) {
	const dispatch = useDispatch();

	const { stepName, goToNextStep, existingSiteCount, flowName } = props;

	useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
		triggerGuidesForStep( flowName, stepName );
	}, [ dispatch, flowName, stepName ] );

	const branchSteps = useBranchSteps( stepName, () => [ 'difm-site-picker' ] );

	const newOrExistingSiteSelected = ( value: ChoiceType ) => {
		// If 'new-site' is selected, skip the `difm-site-picker` step.
		if ( 'new-site' === value ) {
			branchSteps( {} );
			dispatch( removeSiteSlugDependency() );
		}
		dispatch(
			submitSignupStep(
				{ stepName: stepName },
				{
					newOrExistingSiteChoice: value,
					forceAutoGeneratedBlogName: true,
				}
			)
		);
		goToNextStep();
	};

	const showNewOrExistingSiteChoice = existingSiteCount > 0;

	return (
		<StepWrapper
			stepContent={
				<DIFMLanding
					onPrimarySubmit={ () =>
						showNewOrExistingSiteChoice
							? newOrExistingSiteSelected( 'existing-site' )
							: newOrExistingSiteSelected( 'new-site' )
					}
					onSecondarySubmit={ () => newOrExistingSiteSelected( 'new-site' ) }
					showNewOrExistingSiteChoice={ showNewOrExistingSiteChoice }
					isStoreFlow={ 'do-it-for-me-store' === flowName }
				/>
			}
			hideFormattedHeader
			align="left"
			hideSkip
			isHorizontalLayout={ false }
			isWideLayout
			headerImageUrl={ difmImage }
			{ ...props }
		/>
	);
}
