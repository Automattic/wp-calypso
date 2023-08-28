/* eslint-disable wpcalypso/jsx-classname-namespace */

import { Button } from '@automattic/components';
import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { ReactElement, useEffect, useState } from 'react';
import BlogIntentImage from 'calypso/assets/images/onboarding/videopress-onboarding-intent/intent-blog.png';
import ChannelIntentImage from 'calypso/assets/images/onboarding/videopress-onboarding-intent/intent-channel.png';
import JetpackIntentImage from 'calypso/assets/images/onboarding/videopress-onboarding-intent/intent-jetpack.png';
import OtherIntentImage from 'calypso/assets/images/onboarding/videopress-onboarding-intent/intent-other.png';
import PortfolioIntentImage from 'calypso/assets/images/onboarding/videopress-onboarding-intent/intent-portfolio.png';
import SingleVideoIntentImage from 'calypso/assets/images/onboarding/videopress-onboarding-intent/intent-single-video.png';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CloseIcon from '../intro/icons/close-icon';
import VideoPressOnboardingIntentItem from './intent-item';
import VideoPressOnboardingIntentModalBlog from './videopress-onboarding-intent-modal-blog';
import VideoPressOnboardingIntentModalChannel from './videopress-onboarding-intent-modal-channel';
import VideoPressOnboardingIntentModalJetpack from './videopress-onboarding-intent-modal-jetpack';
import VideoPressOnboardingIntentModalPortfolio from './videopress-onboarding-intent-modal-portfolio';
import VideoPressOnboardingIntentModalVideoUpload from './videopress-onboarding-intent-modal-video-upload';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';

import './styles.scss';

const VideoPressOnboardingIntent: Step = ( { navigation } ) => {
	const { __ } = useI18n();
	const [ intentClickNumber, setIntentClicksNumber ] = useState( 1 );
	const [ modal, setModal ] = useState< ReactElement | null >( null );

	const { submit } = navigation;

	const handleSubmit = () => {
		submit?.();
	};

	const sendTracksIntent = ( intent: string ) => {
		recordTracksEvent( 'calypso_videopress_onboarding_intent_clicked', {
			intent,
			click_number: intentClickNumber,
		} );
		setIntentClicksNumber( intentClickNumber + 1 );
	};

	const onVideoPortfolioIntentClicked = () => {
		sendTracksIntent( 'portfolio' );
		setModal( <VideoPressOnboardingIntentModalPortfolio onSubmit={ handleSubmit } /> );
	};

	const onVideoChannelIntentClicked = () => {
		sendTracksIntent( 'videochannel' );
		setModal( <VideoPressOnboardingIntentModalChannel onSubmit={ handleSubmit } /> );
	};

	const onUploadVideoIntentClicked = () => {
		sendTracksIntent( 'videoupload' );
		setModal( <VideoPressOnboardingIntentModalVideoUpload onSubmit={ handleSubmit } /> );
	};

	const onJetpackIntentClicked = () => {
		sendTracksIntent( 'jetpack' );
		setModal( <VideoPressOnboardingIntentModalJetpack /> );
	};

	const onVideoBlogIntentClicked = () => {
		sendTracksIntent( 'blog' );
		setModal( <VideoPressOnboardingIntentModalBlog onSubmit={ handleSubmit } /> );
	};

	const onOtherIntentClicked = () => {
		sendTracksIntent( 'other' );
	};

	const modalClasses = classNames( 'intro__more-modal videopress-intro-modal', {
		show: modal ? true : false,
	} );

	const stepContent = (
		<>
			<div className="videopress-onboarding-intent__step-content">
				<VideoPressOnboardingIntentItem
					title={ __( 'Get a video portfolio' ) }
					description={ __( 'Share your work with the world.' ) }
					image={ PortfolioIntentImage }
					onClick={ onVideoPortfolioIntentClicked }
				/>
				<VideoPressOnboardingIntentItem
					title={ __( 'Create a channel for your videos' ) }
					description={ __(
						'The easiest way to upload videos and create a community around them.'
					) }
					image={ ChannelIntentImage }
					onClick={ onVideoChannelIntentClicked }
				/>
				<VideoPressOnboardingIntentItem
					title={ __( 'Upload a video' ) }
					description={ __( 'Just put a video on the internet.' ) }
					image={ SingleVideoIntentImage }
					onClick={ onUploadVideoIntentClicked }
				/>
				<VideoPressOnboardingIntentItem
					title={ __( 'Add video to an existing site' ) }
					description={ __(
						'All the advantages and features from VideoPress, on your own WordPress site.'
					) }
					image={ JetpackIntentImage }
					onClick={ onJetpackIntentClicked }
				/>
				<VideoPressOnboardingIntentItem
					title={ __( 'Start a blog with video content' ) }
					description={ __( 'Use advanced media formats to enhance your storytelling.' ) }
					image={ BlogIntentImage }
					onClick={ onVideoBlogIntentClicked }
				/>
				<VideoPressOnboardingIntentItem
					title={ __( 'Other' ) }
					description={ __( 'What are you looking for? Let us know!' ) }
					image={ OtherIntentImage }
					onClick={ onOtherIntentClicked }
				/>
			</div>

			<div className={ modalClasses } aria-modal="true">
				<div className="intro__more-modal-container">
					<div className="intro__more-modal-header">
						<Button plain onClick={ () => setModal( null ) }>
							<CloseIcon />
						</Button>
					</div>
					{ modal && <modal.type { ...modal.props } /> }
				</div>
			</div>
		</>
	);

	useEffect( () => {
		const onCloseKeyPressed = ( event: KeyboardEvent ) => {
			if ( 'Escape' === event.key ) {
				setModal( null );
			}
		};
		window.addEventListener( 'keydown', onCloseKeyPressed, false );
		return () => window.removeEventListener( 'keydown', onCloseKeyPressed );
	}, [] );

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
