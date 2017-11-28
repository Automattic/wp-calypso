/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
* Internal dependencies
*/
import NoticeAction from 'components/notice/notice-action';
import Notice from 'components/notice';

class Notices extends React.PureComponent {
	static displayName = 'Notice';

	state = {
		compactNotices: false,
	};

	render() {
		var toggleNoticesText = this.state.compactNotices ? 'Normal Notices' : 'Compact Notices';

		return (
			<div>
				<a className="docs__design-toggle button" onClick={ this.toggleNotices }>
					{ toggleNoticesText }
				</a>
				<div>
					<Notice showDismiss={ false } isCompact={ this.state.compactNotices ? true : null }>
						I'm a notice with no status and <a>a link</a>.
					</Notice>
				</div>
				<div>
					<Notice
						text="I'm a notice with no status and an action."
						showDismiss={ false }
						isCompact={ this.state.compactNotices ? true : null }
					>
						<NoticeAction href="#">{ 'Update' }</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-info"
						text="I'm an `is-info` notice with custom icon."
						icon="heart"
						isCompact={ this.state.compactNotices ? true : null }
					/>
				</div>
				<div>
					<Notice
						status="is-info"
						showDismiss={ false }
						text="I'm an `is-info` notice with custom icon and an action."
						icon="heart"
						isCompact={ this.state.compactNotices ? true : null }
					>
						<NoticeAction href="#">{ 'Update' }</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-success"
						text="I'm an `is-success` notice."
						isCompact={ this.state.compactNotices ? true : null }
					/>
				</div>
				<div>
					<Notice
						status="is-error"
						showDismiss={ false }
						text="I'm an `is-error` notice."
						isCompact={ this.state.compactNotices ? true : null }
					>
						<NoticeAction href="#">{ 'Update' }</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-warning"
						icon="mention"
						text="I'm an `is-warning` notice with custom icon."
						isCompact={ this.state.compactNotices ? true : null }
					/>
				</div>
				<div>
					<Notice
						status="is-warning"
						isCompact={ this.state.compactNotices ? true : null }
						showDismiss={ false }
						text={ "I'm an `is-warning` notice with an action." }
					>
						<NoticeAction href="#">{ 'Update' }</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-success"
						isCompact={ this.state.compactNotices ? true : null }
						showDismiss={ false }
						text={ "I'm an `is-success` notice with an arrow link." }
					>
						<NoticeAction href="#" external={ true }>
							{ 'Preview' }
						</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-error"
						showDismiss={ true }
						text="I'm an always dismissable error notice."
						isCompact={ this.state.compactNotices ? true : null }
					>
						<NoticeAction href="#">More</NoticeAction>
					</Notice>
				</div>
			</div>
		);
	}

	toggleNotices = () => {
		this.setState( { compactNotices: ! this.state.compactNotices } );
	};
}

export default Notices;
