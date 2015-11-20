/**
 * External Dependencies
 */
var React = require( 'react' ),
	classNames = require( 'classnames' ),
	debug = require( 'debug' )( 'calypso:notices' );

/**
 * Internal Dependencies
 */
var Notice = require( './notice' ),
	observe = require( 'lib/mixins/data-observe' ),
	DeleteSiteNotices = require( './delete-site-notices' );

module.exports = React.createClass( {

	displayName: 'NoticesList',

	mixins: [ observe( 'notices' ) ],

	propTypes: {
		id: React.PropTypes.string,
		notices: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.array
		] ),
		forcePinned: React.PropTypes.bool
	},

	getInitialState: function() {
		return { pinned: this.props.forcePinned };
	},

	getDefaultProps: function() {
		return {
			id: 'overlay-notices',
			notices: Object.freeze( [] ),
			forcePinned: false
		};
	},

	componentWillMount: function() {
		debug( 'Mounting Notices React component.' );
	},

	componentDidMount: function() {
		if ( ! this.props.forcePinned ) {
			window.addEventListener( 'scroll', this.updatePinnedState );
		}
	},

	componentDidUpdate: function( prevProps ) {
		if ( this.props.forcePinned && ! prevProps.forcePinned ) {
			window.removeEventListener( 'scroll', this.updatePinnedState );
			this.setState( { pinned: true } );
		} else if ( ! this.props.forcePinned && prevProps.forcePinned ) {
			window.addEventListener( 'scroll', this.updatePinnedState );
			this.updatePinnedState();
		}
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'scroll', this.updatePinnedState );
	},

	updatePinnedState: function() {
		this.setState( { pinned: window.scrollY > 0 } );
	},

	render: function() {
		var noticesRaw = this.props.notices[ this.props.id ] || [],
			noticesList = noticesRaw.map( function( notice, index ) {
				return (
					<Notice key={ 'notice-' + index } type={ notice.type } status={ notice.status } text={ notice.text }
					duration={ notice.duration } button={ notice.button } href={ notice.href } raw={ notice }
					container={ notice.container } arrow={ notice.arrow }
					isCompact={ notice.isCompact } onClick={ notice.onClick } showDismiss={ notice.showDismiss } />
				);
			}, this );

		if ( ! noticesRaw.length ) {
			return null;
		}
		return (
			<div>
				<div id={ this.props.id } className={ classNames( 'notices-list', { 'is-pinned': this.state.pinned } ) }>
					<DeleteSiteNotices />
					{ noticesList }
				</div>
				{ this.state.pinned && ! this.props.forcePinned ? <div className="notices-list__whitespace"/> : null }
			</div>
		);
	}

} );
