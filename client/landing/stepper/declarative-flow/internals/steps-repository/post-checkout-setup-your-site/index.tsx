import { BigSkyLogo } from '@automattic/components/src/logos/big-sky-logo';
import { Step } from '@automattic/onboarding';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { code } from '@wordpress/icons';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteData } from '../../../../hooks/use-site-data';
import { STEPS } from '../../steps';
import FlowCard from '../components/flow-card';
import type { Step as StepType } from '../../types';
import './style.scss';

const PostCheckoutSetupYourSiteStep: StepType = ( { navigation } ) => {
	const { submit } = navigation;
	const { siteSlug, siteId } = useSiteData();
	const translate = useTranslate();

	const handleBuildWithAI = () => {
		recordTracksEvent( 'calypso_onboarding_post_checkout_build_with_ai_click' );
		submit?.();
	};

	const handleBlankSite = () => {
		recordTracksEvent( 'calypso_onboarding_post_checkout_blank_site_click' );
		window.location.replace( `/sites/${ siteSlug }` );
	};

	const handleMigrate = () => {
		recordTracksEvent( 'calypso_onboarding_post_checkout_migrate_click' );
		window.location.assign(
			addQueryArgs( `/setup/site-migration/${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }`, {
				siteSlug,
				siteId,
			} )
		);
	};

	const stepContent = (
		<VStack alignment="top" spacing="2">
			<FlowCard
				icon={ <BigSkyLogo.CentralLogo heartless size={ 24 } /> }
				title={ translate( 'Build with AI' ) }
				text={ translate( 'Prompt, edit, and launch a site in just a few clicks.' ) }
				onClick={ handleBuildWithAI }
			/>
			<FlowCard
				icon={ code }
				title={ translate( 'Start with a blank site' ) }
				text={ translate( 'Get started instantly with a simple, ready-to-go WordPress site.' ) }
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
					text={ translate( 'Set up your site.' ) }
					subText={ translate(
						"No matter what you want to do, there's an easy way to get started."
					) }
				/>
			}
		>
			{ stepContent }
		</Step.CenteredColumnLayout>
	);
};

export default PostCheckoutSetupYourSiteStep;
