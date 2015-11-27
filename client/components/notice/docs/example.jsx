/**
* External dependencies
*/
var React = require( 'react' );

/**
* Internal dependencies
*/
var NoticeArrowLink = require( 'notices/arrow-link' ),
	SimpleNotice = require( 'notices/simple-notice' ),
	Notice = require( 'notices/notice' );

var Notices = React.createClass( {
	mixins: [ React.addons.PureRenderMixin ],

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

				<Notice text="I'm a notice with no status." isCompact={ this.state.compactNotices ? true : null } />
				<Notice status="is-info" text="I'm an `is-info` notice." isCompact={ this.state.compactNotices ? true : null } />
				<Notice status="is-success" text="I'm an `is-success` notice." isCompact={ this.state.compactNotices ? true : null } />
				<Notice status="is-error" text="I'm an `is-error` notice." isCompact={ this.state.compactNotices ? true : null } />
				<Notice status="is-warning" text="I'm an `is-warning` notice." isCompact={ this.state.compactNotices ? true : null } />
				<SimpleNotice
					status="is-success"
					isCompact={ this.state.compactNotices ? true : null }
					showDismiss={ false }
					text={ "I'm an `is-success` notice with an arrow link." }>
					<NoticeArrowLink href="#">
						{ "Preview" }
					</NoticeArrowLink>
				</SimpleNotice>
			</div>
		);
	},

	toggleNotices: function() {
		this.setState( { compactNotices: ! this.state.compactNotices } );
	}
} );

module.exports = Notices;
