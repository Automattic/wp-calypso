import { BackButton } from '@automattic/onboarding';
import ImportedSiteOptions from 'calypso/signup/steps/site-options/site-options';
import { useHeroStepNavigation } from '../../../hooks/use-hero-navigation';

export function HeroFlowSiteOptions(): React.ReactElement {
	const { goBack, goNext } = useHeroStepNavigation();

	const handleSubmit = () => {
		goNext();
	};

	return (
		<div>
			<BackButton onClick={ goBack } />
			<ImportedSiteOptions defaultSiteTitle="" defaultTagline="" onSubmit={ handleSubmit } />
		</div>
	);
}
