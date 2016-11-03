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
		target: React.PropTypes.string,
		iconSize: React.PropTypes.oneOf( [ 18, 24 ] ),
	},

	getDefaultProps: function() {
		return {
			includeNonDraftStatuses: false,
			link: null,
			target: null,
			iconSize: 18
		};
	},

	getRelativeTimeText: function() {
		var status = this.props.post.status,
			iconSize = this.props.iconSize,
			time, timeReference;

		if ( status === 'draft' || status === 'pending' ) {
			time = this.props.post.modified;
			timeReference = ( <small style={ { marginLeft: 2 } }>{ this.translate( ' (last-modified)' ) }</small> );
		} else if ( status !== 'new' ) {
			time = this.props.post.date;
		}

		if ( ! time ) {
			return;
		}

		return (
			<span className="time">
				<Gridicon icon="time" size={ iconSize } />
				<span className="time-text">
					{ this.moment( time ).fromNow() }{ timeReference }
				</span>
			</span>
		);
	},

	getStatusText: function() {
		var status = this.props.post.status,
			iconSize = this.props.iconSize,
			statusClassName = 'status',
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
					<Gridicon icon={ statusIcon } size={ iconSize } />
					<span className="status-text">{ statusText }</span>
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
