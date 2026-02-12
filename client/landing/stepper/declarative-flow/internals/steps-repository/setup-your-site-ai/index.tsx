import { BigSkyLogo, SummaryButton } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { __experimentalVStack as VStack, Icon } from '@wordpress/components';
import { layout } from '@wordpress/icons';
import i18n, { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteData } from '../../../../hooks/use-site-data';
import type { Step as StepType } from '../../types';
import './style.scss';

const SetupYourSiteAIStep: StepType = ( { navigation } ) => {
	const { siteSlug, siteId } = useSiteData();
	const translate = useTranslate();

	const handleBuildWithAI = () => {
		recordTracksEvent( 'calypso_onboarding_setup_your_site_with_ai_selection', {
			selection: 'build-with-ai',
		} );

		navigation.submit( {
			setupChoice: 'build-with-ai',
			siteSlug,
			siteId,
		} );
	};

	const handleBlankSite = () => {
		recordTracksEvent( 'calypso_onboarding_setup_your_site_with_ai_selection', {
			selection: 'blank-site',
		} );

		navigation.submit( {
			setupChoice: 'blank-site',
			siteSlug,
		} );
	};

	const stepContent = (
		<VStack alignment="top" spacing={ 3 }>
			<SummaryButton
				title={ translate( 'Build with AI' ) }
				description={ i18n.fixMe( {
					text: 'Describe your idea and let AI help you refine your site.',
					newCopy: translate( 'Describe your idea and let AI help you refine your site.' ),
					oldCopy: translate( 'Prompt, edit, and launch a site in just a few clicks.' ),
				} ) }
				decoration={ <BigSkyLogo.CentralLogo heartless /> }
				onClick={ handleBuildWithAI }
			/>
			<SummaryButton
				title={ i18n.fixMe( {
					text: 'Manual setup',
					newCopy: translate( 'Manual setup' ),
					oldCopy: translate( 'Start with a blank site' ),
				} ) }
				description={ translate(
					'Get started instantly with a simple, ready-to-go WordPress site.'
				) }
				decoration={ <Icon icon={ layout } /> }
				onClick={ handleBlankSite }
			/>
		</VStack>
	);

	return (
		<Step.CenteredColumnLayout
			className="setup-your-site-ai-step"
			columnWidth={ 5 }
			verticalAlign="center"
			topBar={ <Step.TopBar /> }
			heading={
				<Step.Heading
					text={ translate( 'Set up your site' ) }
					subText={ i18n.fixMe( {
						text: "Whatever you're making, there's an easy way to get started.",
						newCopy: translate( "Whatever you're making, there's an easy way to get started." ),
						oldCopy: translate(
							"No matter what you want to do, there's an easy way to get started."
						),
					} ) }
				/>
			}
		>
			{ stepContent }
		</Step.CenteredColumnLayout>
	);
};

export default SetupYourSiteAIStep;
