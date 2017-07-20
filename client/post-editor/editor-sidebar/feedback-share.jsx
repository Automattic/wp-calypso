/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import Gravatar from 'components/gravatar';
import FeedbackComments from './feedback-comments';

export const FeedbackShare = ( { share, onToggle, translate } ) => {
	const { emailAddress, comments, } = share;

	return <Accordion
		title={ emailAddress }
		icon={ <Gravatar /> }
		onToggle={ onToggle }
	>
		{ comments.length === 0
			? translate( 'No feedback yet.' )
			: <FeedbackComments comments={ comments } /> }
	</Accordion>;
};

FeedbackShare.propTypes = {
	share: PropTypes.object.isRequired,
	onToggle: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( FeedbackShare );
