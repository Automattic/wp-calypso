/**
* External dependencies
*/
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
* Internal dependencies
*/
import DocsExample from 'components/docs-example';
import NoticeAction from 'components/notice/notice-action';
import Notice from 'components/notice';

var Notices = React.createClass( {
	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			compactNotices: false
		};
	},

	render: function() {
		return (
			<DocsExample
				title="Notices"
				url="/devdocs/design/notices"
				componentUsageStats={ this.props.getUsageStats( Notice ) }
				toggleHandler={ this.toggleNotices }
				toggleText={ this.state.compactNotices ? 'Normal Notices' : 'Compact Notices' }
			>
				<div>
					<Notice
						showDismiss={ false }
						isCompact={ this.state.compactNotices ? true : null }>
						I'm a notice with no status and <a>a link</a>.
					</Notice>
				</div>
				<div>
					<Notice
						text="I'm a notice with no status and an action."
						showDismiss={ false }
						isCompact={ this.state.compactNotices ? true : null }>
						<NoticeAction href="#">
							{ "Update" }
						</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-info"
						text="I'm an `is-info` notice with custom icon."
						icon="heart"
						isCompact={ this.state.compactNotices ? true : null } />
				</div>
				<div>
					<Notice
						status="is-info"
						showDismiss={ false }
						text="I'm an `is-info` notice with custom icon and an action."
						icon="heart"
						isCompact={ this.state.compactNotices ? true : null }>
						<NoticeAction href="#">
							{ "Update" }
						</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice status="is-success" text="I'm an `is-success` notice." isCompact={ this.state.compactNotices ? true : null } />
				</div>
				<div>
					<Notice
						status="is-error"
						showDismiss={ false }
						text="I'm an `is-error` notice."
						isCompact={ this.state.compactNotices ? true : null }>
						<NoticeAction href="#">
							{ "Update" }
						</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-warning"
						icon="mention"
						text="I'm an `is-warning` notice with custom icon."
						isCompact={ this.state.compactNotices ? true : null } />
				</div>
				<div>
					<Notice
						status="is-warning"
						isCompact={ this.state.compactNotices ? true : null }
						showDismiss={ false }
						text={ "I'm an `is-warning` notice with an action." }>
						<NoticeAction href="#">
							{ "Update" }
						</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-success"
						isCompact={ this.state.compactNotices ? true : null }
						showDismiss={ false }
						text={ "I'm an `is-success` notice with an arrow link." }>
						<NoticeAction href="#" external={ true }>
							{ "Preview" }
						</NoticeAction>
					</Notice>
				</div>
			</DocsExample>
		);
	},

	toggleNotices: function() {
		this.setState( { compactNotices: ! this.state.compactNotices } );
	}
} );

module.exports = Notices;
