import { BigSkyLogo, SummaryButton } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { __experimentalVStack as VStack, Button, Icon } from '@wordpress/components';
import { code } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteData } from '../../../../hooks/use-site-data';
import type { Step as StepType } from '../../types';
import './style.scss';

const PostCheckoutSetupYourSiteStep: StepType = ( { navigation } ) => {
	const { siteSlug, siteId } = useSiteData();
	const translate = useTranslate();

	const handleBuildWithAI = () => {
		recordTracksEvent( 'calypso_onboarding_post_checkout_build_with_ai_click' );

		navigation.submit( {
			setupChoice: 'build-with-ai',
			siteSlug,
			siteId,
		} );
	};

	const handleBlankSite = () => {
		recordTracksEvent( 'calypso_onboarding_post_checkout_blank_site_click' );

		navigation.submit( {
			setupChoice: 'blank-site',
			siteSlug,
		} );
	};

	const handleMigrate = () => {
		recordTracksEvent( 'calypso_onboarding_post_checkout_migrate_click' );

		navigation.submit( {
			setupChoice: 'migrate',
			siteSlug,
			siteId,
		} );
	};

	const stepContent = (
		<VStack alignment="top" spacing={ 3 }>
			<SummaryButton
				title={ translate( 'Build with AI' ) }
				description={ translate( 'Prompt, edit, and launch a site in just a few clicks.' ) }
				decoration={ <BigSkyLogo.CentralLogo heartless /> }
				onClick={ handleBuildWithAI }
			/>
			<SummaryButton
				title={ translate( 'Start with a blank site' ) }
				description={ translate(
					'Get started instantly with a simple, ready-to-go WordPress site.'
				) }
				decoration={ <Icon icon={ code } /> }
				onClick={ handleBlankSite }
			/>
			<Button
				className="post-checkout-custom-step__migrate-button"
				variant="link"
				onClick={ handleMigrate }
			>
				{ translate( 'Or migrate your site' ) }
			</Button>
		</VStack>
	);

	return (
		<Step.CenteredColumnLayout
			className="post-checkout-setup-your-site-step"
			columnWidth={ 5 }
			verticalAlign="center"
			topBar={ <Step.TopBar /> }
			heading={
				<Step.Heading
					text={ translate( 'Set up your site' ) }
					subText={ translate(
						"No matter what you want to do, there's an easy way to get started"
					) }
				/>
			}
		>
			{ stepContent }
		</Step.CenteredColumnLayout>
	);
};

export default PostCheckoutSetupYourSiteStep;
