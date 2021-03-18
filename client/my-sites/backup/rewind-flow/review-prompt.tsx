/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import DismissibleCard from 'calypso/blocks/dismissible-card';

const JetpackReviewPrompt: FunctionComponent = () => {
	const translate = useTranslate();
	return (
		<DismissibleCard preferenceName="jetpack-review-prompt">
			<a
				target="_blank"
				rel="noopener noreferrer"
				href="https://wordpress.org/support/plugin/jetpack/reviews/#new-post"
			>
				{ translate(
					'Give Jetpack a thumbs up here if you thought it was easy to start a restore'
				) }
			</a>
		</DismissibleCard>
	);
};

export default JetpackReviewPrompt;
