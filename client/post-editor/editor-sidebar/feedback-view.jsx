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
class FeedbackView extends PureComponent {
	static propTypes = {
		translate: PropTypes.func,
		close: PropTypes.func,
		sharedLinks: PropTypes.array
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
		return (
			<div className="editor-sidebar__view">
				<FeedbackSidebarHeader closeFeedback={ this.props.close } />
				{ this.isAllFeedbackClosed() ? this.renderRequestForm() : null }
				{ this.haveShares() ? this.renderFeedbackList() : null }
				<SidebarFooter />
			</div>
		);
	}

	renderRequestForm() {
		return (
			<div>
				<div className="editor-sidebar__feedback-header-image-box"></div>
				<FeedbackRequestForm />
			</div>
		);
	}

	renderFeedbackList() {
		const { sharedLinks, translate } = this.props;
		const labelClasses = classNames( {
			'editor-sidebar__feedback-list-label': true,
			'is-hidden': ! this.isAllFeedbackClosed()
		} );

		return (
			<div>
				<div className={ labelClasses }>
					{ translate( 'Friends' ) }
				</div>
				<FeedbackList sharedLinks={ sharedLinks }
					onToggleFeedback={ this.onToggleFeedback } />
			</div>
		);
	}
}

export default localize( FeedbackView );
