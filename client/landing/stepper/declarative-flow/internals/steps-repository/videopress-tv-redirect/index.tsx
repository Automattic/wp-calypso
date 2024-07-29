/* eslint-disable wpcalypso/jsx-classname-namespace */

import { StepContainer } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';

import './styles.scss';

const VideoPressTvRedirect: Step = function VideoPressTvRedirect( { data } ) {
	const { __ } = useI18n();

	const stepContent = (
		<div className="videopress-tv-purchase-redirect__step-content intro__button-row">
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
			stepName="redirect"
			isWideLayout
			hideBack
			flowName="videopress-tv-purchase"
			formattedHeader={
				<FormattedHeader
					id="videopress-tv-purchase-redirect-header"
					headerText={ __( 'Redirecting to your VideoPress TV video site' ) }
					align="center"
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			showVideoPressPowered
		/>
	);
};

export default VideoPressTvRedirect;
