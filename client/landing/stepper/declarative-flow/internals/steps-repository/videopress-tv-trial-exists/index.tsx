/* eslint-disable wpcalypso/jsx-classname-namespace */

import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';

import './styles.scss';

const VideoPressTvTrialExists: Step = function VideoPressTvTrialExists( { data } ) {
	const { __ } = useI18n();

	const stepContent = (
		<div className="videopress-tv-trial-exists__step-content intro__button-row">
			<button
				className="button intro__button is-primary"
				onClick={ () => ( window.location.href = String( data?.url ) ) }
			>
				Visit your site
			</button>
		</div>
	);

	return (
		<StepContainer
			stepName="trial-exists"
			isWideLayout
			hideBack
			flowName="videopress-tv"
			formattedHeader={
				<FormattedHeader
					id="videopress-tv-trial-exists-header"
					headerText={ __( 'You already have a trial VideoPress TV site' ) }
					align="center"
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			showVideoPressPowered
		/>
	);
};

export default VideoPressTvTrialExists;
