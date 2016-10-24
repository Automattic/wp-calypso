/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' );

/**
 * Internal dependencies
 */
var Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {

	displayName: 'PostRelativeTime',

	mixins: [ PureRenderMixin ],

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
		const status = this.props.post.status;

		let time;
		if ( status === 'draft' || status === 'pending' ) {
			time = this.props.post.modified;
		} else if ( status !== 'new' ) {
			time = this.props.post.date;
		}

		if ( ! time ) {
			return;
		}

		return (
			<span className="post-relative-time-status__time">
				<Gridicon icon="time" size={ 18 } />
				<span className="post-relative-time-status__time-text">
					{ this.moment( time ).fromNow() }
				</span>
			</span>
		);
	},

	getStatusText: function() {
		var status = this.props.post.status,
			statusClassName = 'post-relative-time-status__status',
			statusIcon = 'aside',
			statusText;

		if ( this.props.post.sticky ) {
			statusText = this.translate( 'sticky' );
			statusClassName += ' is-sticky';
			statusIcon = 'bookmark-outline';
		} else if ( status === 'pending' ) {
			statusText = this.translate( 'pending review' );
			statusClassName += ' is-pending';
		} else if ( status === 'future' ) {
			statusText = this.translate( 'scheduled' );
			statusClassName += ' is-scheduled';
			statusIcon = 'calendar';
		} else if ( status === 'trash' ) {
			statusText = this.translate( 'trashed' );
			statusClassName += ' is-trash';
			statusIcon = 'trash';
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
			return (
				<span className={ statusClassName }>
					<Gridicon icon={ statusIcon } size={ 18 } />
					<span className="post-relative-time-status__status-text">
						{ statusText }
					</span>
				</span>
			);
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
