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

export const FeedbackShare = ( { share, onToggle, translate } ) => {
	const { emailAddress, comments } = share;

	return (
		<Accordion
			className="editor-sidebar__feedback-share"
			title={ emailAddress }
			subtitle="Subtitle TODO"
			icon={ <Gravatar size={ 24 } /> }
			onToggle={ onToggle }
		>
			{ comments.length === 0
				? <p className="editor-sidebar__feedback-share-empty-message">
						{ translate( 'No feedback yet.' ) }
					</p>
				: comments.map(
						// NOTE: It should be OK to use the index for `key` because
						// the list is currently append-only
						( comment, index ) =>
							<p key={ index }>
								{ comment }
							</p>,
					) }
		</Accordion>
	);
};

FeedbackShare.propTypes = {
	share: PropTypes.object.isRequired,
	onToggle: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

export default localize( FeedbackShare );
