import ImportedSiteOptions from 'calypso/signup/steps/site-options/site-options';
import { BackButton } from '../components/back-button';
import { useStepNav } from '../hooks/use-setup-nav';

export function SiteOptions(): React.ReactElement {
	const page = useStepNav();

	const handleSubmit = () => {
		page( 'starting-point' );
	};

	return (
		<div>
			<BackButton defaultBack={ undefined } />
			<ImportedSiteOptions defaultSiteTitle="" defaultTagline="" onSubmit={ handleSubmit } />
		</div>
	);
}
