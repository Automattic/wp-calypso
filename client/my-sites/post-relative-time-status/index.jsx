/**
 * External dependencies
 */
var React = require( 'react/addons' );

module.exports = React.createClass( {

	displayName: 'PostRelativeTime',

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		post: React.PropTypes.object.isRequired,
		includeNonDraftStatuses: React.PropTypes.bool,
		link: React.PropTypes.string,
		target: React.PropTypes.string
	},

	getDefaultProps: function() {
		return {
			includeNonDraftStatuses: false,
			link: null,
			target: null
		};
	},

	getRelativeTimeText: function() {
		var status = this.props.post.status,
			time, timeReference;

		if ( status === 'draft' || status === 'pending' ) {
			time = this.props.post.modified;
			timeReference = ( <small>{ this.translate( ' (last-modified)' ) }</small> );
		} else if ( status !== 'new' ) {
			time = this.props.post.date;
			timeReference = null;
		}

		if ( ! time ) {
			return null;
		}

		return ( <span className="time"><span className="noticon noticon-time"></span><span className="time-text">{ this.moment( time ).fromNow() }</span>{ timeReference }</span> );
	},

	getStatusText: function() {
		var status = this.props.post.status,
			statusClassName = 'status',
			statusText;

		if ( this.props.post.sticky ) {
			statusText = this.translate( 'sticky' );
			statusClassName += ' is-sticky';
		} else if ( status === 'pending' ) {
			statusText = this.translate( 'pending review' );
			statusClassName += ' is-pending';
		} else if ( status === 'future' ) {
			statusText = this.translate( 'scheduled' );
			statusClassName += ' is-scheduled';
		} else if ( status === 'trash' ) {
			statusText = this.translate( 'trashed' );
			statusClassName += ' is-trash';
		} else if ( this.props.includeBasicStatus ) {
			if ( status === 'draft' ) {
				statusText = this.translate( 'draft' );
			} else if ( status === 'publish' ) {
				statusText = this.translate( 'published' );
			} else if ( status === 'new' ) {
				statusText = this.translate( 'Publish immediately' );
			}
		}

		if ( statusText ) {
			return ( <span className={ statusClassName }><span className="noticon noticon-document"></span><span className="status-text">{ statusText }</span></span> );
		}
	},

	render: function() {
		var timeText = this.getRelativeTimeText(),
			statusText = this.getStatusText(),
			realtiveTimeClass = ( timeText ) ? 'post-relative-time-status' : null,
			innerText = ( <span>{ timeText }{ statusText }</span> ),
			details;

		if ( this.props.link ) {
			details = ( <p className={ realtiveTimeClass }><a href={ this.props.link } target={ this.props.target } onClick={ this.props.onClick }>{ innerText }</a></p> );
		} else {
			details = ( <p className={ realtiveTimeClass }>{ innerText }</p> );
		}

		return details;
	}
} );
