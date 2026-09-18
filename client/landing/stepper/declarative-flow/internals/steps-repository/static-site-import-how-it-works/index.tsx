import { Step } from '@automattic/onboarding';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import DocumentHead from 'calypso/components/data/document-head';
import {
	ImportCard,
	SourceCard,
	useStaticSiteImportSource,
} from '../components/static-site-import';
import type { Step as StepType } from '../../types';

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
				<VStack spacing={ 8 }>
					<SourceCard />
					<ImportCard title={ __( 'What happens next' ) }>
						<VStack as="ol" spacing={ 6 } style={ { margin: 0, padding: 0, listStyle: 'none' } }>
							{ steps.map( ( step, index ) => (
								<HStack
									as="li"
									key={ step.title }
									alignment="top"
									justify="flex-start"
									spacing={ 6 }
								>
									<Text variant="muted">{ index + 1 }</Text>
									<VStack spacing={ 1 }>
										<Text weight={ 500 }>{ step.title }</Text>
										<Text variant="muted">{ step.text }</Text>
									</VStack>
								</HStack>
							) ) }
						</VStack>
						<div>
							<Button
								__next40pxDefaultSize
								variant="primary"
								onClick={ () => navigation.submit?.() }
							>
								{ __( 'Choose address and plan' ) }
							</Button>
						</div>
					</ImportCard>
				</VStack>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default StaticSiteImportHowItWorks;
