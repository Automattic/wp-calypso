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
import FeedbackShare from './feedback-share';
import SidebarFooter from 'layout/sidebar/footer';

// TODO: Find a clearer word than "share" for the owner of feedback and use it in subcomponent and CSS classes
export class FeedbackView extends PureComponent {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		close: PropTypes.func.isRequired,
		shares: PropTypes.array.isRequired,
	};

	state = {
		// The number of FeedbackShare components that are toggled open in the UI
		totalOpenedShares: 0,
	};

	onToggleShare = isToggledOpen => {
		const { totalOpenedShares } = this.state;

		this.setState( {
			totalOpenedShares: isToggledOpen ? totalOpenedShares + 1 : totalOpenedShares - 1,
		} );
	};

	render() {
		const { shares, translate } = this.props;
		const allSharesClosed = this.state.totalOpenedShares === 0;

		return (
			<div className="editor-sidebar__view">
				<FeedbackSidebarHeader closeFeedback={ this.props.close } />
				{ allSharesClosed &&
					<div>
						<div className="editor-sidebar__feedback-header-image-box" />
						<FeedbackRequestForm />
					</div> }
				{ shares.length > 0 &&
					<div>
						<div
							className={ classNames( {
								'editor-sidebar__feedback-list-label': true,
								'is-hidden': ! allSharesClosed,
							} ) }
						>
							{ translate( 'Friends' ) }
						</div>
						{ shares.map( share =>
							<FeedbackShare
								key={ share.emailAddress }
								share={ share }
								onToggle={ this.onToggleShare }
							/>,
						) }
					</div> }
				<SidebarFooter />
			</div>
		);
	}
}

export default localize( FeedbackView );
