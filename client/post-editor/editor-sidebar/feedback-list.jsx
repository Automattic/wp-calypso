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

class FeedbackList extends PureComponent {
	static propTypes = {
		sharedLinks: PropTypes.array,
		onToggleFeedback: PropTypes.func
	}

	render() {
		const { sharedLinks } = this.props;

		return (
			<div className="editor-sidebar__feedback-list">
				{ sharedLinks.map(
					sharedLink => this.renderSharedLink( sharedLink )
				) }
			</div>
		);
	}

	renderSharedLink( { label, comments } ) {
		const { translate, onToggleFeedback } = this.props;

		return (
			<div className="editor-sidebar__feedback-item">
				<Accordion
					title={ label }
					icon={ <Gravatar /> }
					onToggle={ onToggleFeedback }
					>
					{ comments.length === 0
						? translate( 'No feedback yet.' )
						: this.renderComments( comments ) }
				</Accordion>
			</div>
		);
	}

	renderComments( comments ) {
		return (
			<ol>
				{ comments.map(
					// NOTE: It should be OK to use the index for `key` because
					// the list is currently append-only
					( comment, index ) => ( <li key={ index }>{ comment }</li> )
				) }
			</ol>
		);
	}
}

export default localize( FeedbackList );
