/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import Gravatar from 'components/gravatar';
import FeedbackComments from './feedback-comments';

export class FeedbackList extends PureComponent {
	static propTypes = {
		sharedLinks: PropTypes.array.isRequired,
		onToggleFeedback: PropTypes.func.isRequired
	}

	render() {
		const {
			translate,
			sharedLinks,
			onToggleFeedback
		} = this.props;

		return (
			<div className="editor-sidebar__feedback-list">
				{ sharedLinks.map( ( { label, comments } ) => (
					<div className="editor-sidebar__feedback-item" key={ label }>
						<Accordion
							title={ label }
							icon={ <Gravatar /> }
							onToggle={ onToggleFeedback }
							>
							{ comments.length === 0
								? translate( 'No feedback yet.' )
								: <FeedbackComments comments={ comments } /> }
						</Accordion>
					</div>
				) ) }
			</div>
		);
	}
}

export default localize( FeedbackList );
