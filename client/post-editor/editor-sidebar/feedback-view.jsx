/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import FeedbackSidebarHeader from './feedback-header';
import FeedbackRequestForm from './feedback-request-form';
import FeedbackList from './feedback-list';
import SidebarFooter from 'layout/sidebar/footer';

// TODO: Find a clearer word than "share" for the owner of feedback and use it in subcomponent and CSS classes
export class FeedbackView extends PureComponent {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		close: PropTypes.func.isRequired,
		sharedLinks: PropTypes.array.isRequired
	}

	constructor() {
		super();
		this.state = { openFeedbackCount: 0 };
	}

	onToggleFeedback = isOpen => {
		const { openFeedbackCount } = this.state;

		this.setState( {
			openFeedbackCount: openFeedbackCount + ( isOpen ? 1 : -1 )
		} );
	};

	haveShares() {
		return this.props.sharedLinks.length > 0;
	}

	isAllFeedbackClosed() {
		return this.state.openFeedbackCount === 0;
	}

	render() {
		const { sharedLinks, translate } = this.props;

		return (
			<div className="editor-sidebar__view">
				<FeedbackSidebarHeader closeFeedback={ this.props.close } />
				{ this.isAllFeedbackClosed() && (
					<div>
						<div className="editor-sidebar__feedback-header-image-box"></div>
						<FeedbackRequestForm />
					</div>
				) }
				{ this.haveShares() && (
					<div>
						<div className={ classNames( {
							'editor-sidebar__feedback-list-label': true,
							'is-hidden': ! this.isAllFeedbackClosed()
						} ) }>
							{ translate( 'Friends' ) }
						</div>
						<FeedbackList sharedLinks={ sharedLinks }
							onToggleFeedback={ this.onToggleFeedback } />
					</div>
				) }
				<SidebarFooter />
			</div>
		);
	}
}

export default localize( FeedbackView );
