/**
* External dependencies
*/
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
* Internal dependencies
*/
var NoticeAction = require( 'components/notice/notice-action' ),
	Notice = require( 'components/notice' );

var Notices = React.createClass( {
	mixins: [ PureRenderMixin ],

	getInitialState: function() {
		return {
			compactNotices: false
		};
	},

	render: function() {
		var toggleNoticesText = this.state.compactNotices ? 'Normal Notices' : 'Compact Notices';

		return (
			<div className="design-assets__group">
				<h2>
					<a href="/devdocs/design/notices">Notices</a>
					<a className="design-assets__toggle button" onClick={ this.toggleNotices }>{ toggleNoticesText }</a>
				</h2>

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
			</div>
		);
	},

	toggleNotices: function() {
		this.setState( { compactNotices: ! this.state.compactNotices } );
	}
} );

module.exports = Notices;
