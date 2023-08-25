/* eslint-disable wpcalypso/jsx-classname-namespace */

import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import VideoPressOnboardingIntentItem from './intent-item';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';

import './styles.scss';

const VideoPressOnboardingIntent: Step = () => {
	const { __ } = useI18n();

	const onVideoPortfolioIntentClicked = () => {
		// console.log( 'Video portfolio' );
	};

	const onVideoChannelIntentClicked = () => {
		// console.log( 'Video channel' );
	};

	const onUploadVideoIntentClicked = () => {
		// console.log( 'Upload video' );
	};

	const onAddVideoIntentClicked = () => {
		// console.log( 'Add video' );
	};

	const onVideoBlogIntentClicked = () => {
		// console.log( 'Video blog' );
	};

	const onOtherIntentClicked = () => {
		// console.log( 'Other' );
	};

	const stepContent = (
		<div className="videopress-onboarding-intent__step-content">
			<VideoPressOnboardingIntentItem
				title={ __( 'Get a video portfolio' ) }
				description={ __( 'Share your work with the world.' ) }
				image=""
				onClick={ onVideoPortfolioIntentClicked }
			/>
			<VideoPressOnboardingIntentItem
				title={ __( 'Create a channel for your videos' ) }
				description={ __( 'The easiest way to upload videos and create a community around them.' ) }
				image=""
				onClick={ onVideoChannelIntentClicked }
			/>
			<VideoPressOnboardingIntentItem
				title={ __( 'Upload a video' ) }
				description={ __( 'Just put a video on the internet.' ) }
				image=""
				onClick={ onUploadVideoIntentClicked }
			/>
			<VideoPressOnboardingIntentItem
				title={ __( 'Add video to an existing site' ) }
				description={ __(
					'All the advantages and features from VideoPress, on your own WordPress site.'
				) }
				image=""
				onClick={ onAddVideoIntentClicked }
			/>
			<VideoPressOnboardingIntentItem
				title={ __( 'Start a blog with video content' ) }
				description={ __( 'Use advanced media formats to enhance your storytelling.' ) }
				image=""
				onClick={ onVideoBlogIntentClicked }
			/>
			<VideoPressOnboardingIntentItem
				title={ __( 'Other' ) }
				description={ __( 'What are you looking for? Let us know!' ) }
				image=""
				onClick={ onOtherIntentClicked }
			/>
		</div>
	);

	return (
		<StepContainer
			stepName="videopress-onboarding-intent"
			isWideLayout={ true }
			hideBack={ true }
			flowName="videopress"
			formattedHeader={
				<FormattedHeader
					id="videopress-onboarding-intent-header"
					headerText={ __( 'What would you like to do?' ) }
					subHeaderText={ __(
						'Choose an option to continue, or let us know what you’re looking for.'
					) }
					align="center"
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			showVideoPressPowered
		/>
	);
};

export default VideoPressOnboardingIntent;
