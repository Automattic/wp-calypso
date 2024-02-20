import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const SiteMigrationSource: Step = function ( { navigation } ) {
	const translate = useTranslate();

	const handleSubmit = () => {
		navigation.submit?.();
	};

	const stepContent = (
		<div>
			<p>Enter the url of the site you're migrating.</p>
			<Button primary onClick={ handleSubmit }>
				{ translate( 'Continue' ) }
			</Button>
		</div>
	);

	return (
		<>
			<DocumentHead title="Which site are you migrating?" />
			<StepContainer
				stepName="site-migration-instructions"
				shouldHideNavButtons={ false }
				className="is-step-site-migration-instructions"
				hideSkip={ true }
				hideBack={ true }
				isHorizontalLayout
				formattedHeader={
					<FormattedHeader
						id="site-migration-instructions-header"
						headerText="Which site are you migrating?"
						align="left"
					/>
				}
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationSource;
