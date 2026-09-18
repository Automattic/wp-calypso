import { Step } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import { Panel, SourceCard, useStaticSiteImportSource } from '../components/static-site-import';
import type { Step as StepType } from '../../types';

import '../components/static-site-import/style.scss';
import './style.scss';

const StaticSiteImportHowItWorks: StepType = function StaticSiteImportHowItWorks( { navigation } ) {
	const { __ } = useI18n();
	const { platformName } = useStaticSiteImportSource();

	const steps = [
		{
			title: __( 'Choose your address' ),
			text: __( 'Keep the one you have, or start with a free WordPress.com address.' ),
		},
		{
			title: __( 'Choose a plan' ),
			text: __( 'Pick the plan your site needs and pay for it.' ),
		},
		{
			title: __( 'We rebuild your site' ),
			text: __( 'Your pages, blog posts, images, and design. We’ll email you when it’s ready.' ),
		},
		{
			title: __( 'You take a look' ),
			text: __( 'It stays private until you switch your address over to it.' ),
		},
		{
			title: __( 'Switch your address' ),
			text: platformName
				? sprintf(
						/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
						__( 'Your new site goes public. %s keeps running until then.' ),
						platformName
				  )
				: __( 'Your new site goes public. Your current site keeps running until then.' ),
		},
	];

	return (
		<>
			<DocumentHead title={ __( 'Here’s how the move works' ) } />
			<Step.CenteredColumnLayout
				className="step-container-v2--static-site-import-how-it-works"
				columnWidth={ 8 }
				topBar={
					<Step.TopBar
						leftElement={
							navigation.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
						}
					/>
				}
				heading={
					<Step.Heading
						text={ __( 'Here’s how the move works' ) }
						subText={
							platformName
								? sprintf(
										/* translators: %s: the platform the site is hosted on today, e.g. Wix. */
										__( 'Nothing changes on %s until you switch your address.' ),
										platformName
								  )
								: __( 'Nothing changes on your current site until you switch your address.' )
						}
					/>
				}
			>
				<div className="static-site-import__stack">
					<SourceCard />
					<Panel title={ __( 'What happens next' ) }>
						<ol className="static-site-import-how-it-works__steps">
							{ steps.map( ( step ) => (
								<li key={ step.title }>
									<span className="static-site-import-how-it-works__step-title">
										{ step.title }
									</span>
									<span className="static-site-import__muted">{ step.text }</span>
								</li>
							) ) }
						</ol>
						<Button __next40pxDefaultSize variant="primary" onClick={ () => navigation.submit?.() }>
							{ __( 'Choose address and plan' ) }
						</Button>
					</Panel>
				</div>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default StaticSiteImportHowItWorks;
