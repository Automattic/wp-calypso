/**
 * External dependencies
 */
import { useTranslate } from 'i18n-calypso';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Button } from '@wordpress/components';
import DismissibleCard from 'calypso/blocks/dismissible-card';

const JetpackReviewPrompt: FunctionComponent = () => {
	const translate = useTranslate();
	return (
		<DismissibleCard preferenceName="jetpack-review-prompt" className="review-prompt">
			<p>{ translate( 'Had an easy restore experience?' ) }</p>
			<Button
				href="https://wordpress.org/support/plugin/jetpack/reviews/#new-post"
				isSecondary={ true }
				target="_blank"
			>
				{ translate( 'Leave Jetpack a review' ) }
			</Button>
		</DismissibleCard>
	);
};

export default JetpackReviewPrompt;
