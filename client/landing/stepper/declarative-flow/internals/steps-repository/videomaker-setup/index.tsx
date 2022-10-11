/* eslint-disable wpcalypso/jsx-classname-namespace */

import { StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';

import './styles.scss';

const VideomakerSetup: Step = function VideomakerSetup( { navigation } ) {
	const { submit } = navigation;
	const { __ } = useI18n();
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	const onSelectTheme = ( slug: string ) => {
		setSelectedDesign( {
			slug: 'videomaker',
			theme: slug,
			is_premium: true,
			title: 'Videomaker',
			categories: [],
			features: [],
			template: '',
		} );

		submit?.();
	};

	const stepContent = (
		<div className="videomaker-setup__step-content">
			<div className="videomaker-setup__theme-picker">
				<button
					className="videomaker-setup__dark-button"
					onClick={ () => onSelectTheme( 'premium/videomaker' ) }
				>
					<img
						src="https://videopress2.files.wordpress.com/2022/10/videomaker-theme-dark.jpg"
						alt={ __( 'Videomaker dark' ) }
					/>
				</button>
				<button
					className="videomaker-setup__light-button"
					onClick={ () => onSelectTheme( 'premium/videomaker-white' ) }
				>
					<img
						src="https://videopress2.files.wordpress.com/2022/10/videomaker-theme-light.jpg"
						alt={ __( 'Videomaker white' ) }
					/>
				</button>
			</div>
		</div>
	);

	return (
		<StepContainer
			stepName={ 'videomaker-setup' }
			isWideLayout={ true }
			hideBack={ true }
			flowName={ 'videopress' }
			formattedHeader={
				<FormattedHeader
					id={ 'videomaker-setup-header' }
					headerText={ __( 'Choose a design' ) }
					subHeaderText={ __(
						'This is what your homepage will look like. You’ll be able to customize it further at any time.'
					) }
					align={ 'center' }
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			showVideoPressPowered
		/>
	);
};

export default VideomakerSetup;
