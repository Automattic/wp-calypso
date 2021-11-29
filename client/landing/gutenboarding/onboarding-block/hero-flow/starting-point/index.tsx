import { BackButton } from '@automattic/onboarding';
import ImportedStartingPoint from 'calypso/signup/steps/starting-point/starting-point';
import { StartingPointFlag } from 'calypso/signup/steps/starting-point/types';
import { useHeroStepNavigation } from '../../../hooks/use-hero-navigation';
import { Step } from '../../../path';

export function HeroFlowStaringPoint(): React.ReactElement {
	const { goBack, goNext } = useHeroStepNavigation();

	const handleSelect = ( startingPoint: StartingPointFlag ) => {
		if ( startingPoint === 'design' ) {
			goNext( Step.HeroThemeSelection );
		}
	};

	return (
		<div>
			<BackButton onClick={ goBack } />
			<ImportedStartingPoint onSelect={ handleSelect } />
		</div>
	);
}
