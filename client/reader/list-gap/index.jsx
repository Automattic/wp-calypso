/**
 * External Dependencies
 */
var React = require( 'react/addons' ),
	classnames = require( 'classnames' );

/**
 * Internal Dependencies
 */
var FeedStreamStoreActions = require( 'lib/feed-stream-store/actions' ),
	stats = require( 'reader/stats' );

var Gap = React.createClass( {

	propTypes: {
		gap: React.PropTypes.object.isRequired,
		store: React.PropTypes.object.isRequired,
		selected: React.PropTypes.bool
	},

	getInitialState: function() {
		return { isFilling: false };
	},

	render: function() {
		var classes = classnames( {
			'reader-list-gap': true,
			'is-filling': this.state.isFilling,
			'is-selected': this.props.selected
		} );

		return (
			<div className={ classes } onTouchTap={ this.handleClick } >
				<button type="button" className="button reader-list-gap__button">{ this.translate( 'Load More Posts' ) }</button>
			</div>
		);
	},

	handleClick: function() {
		FeedStreamStoreActions.fillGap( this.props.store.id, this.props.gap );
		this.setState( { isFilling: true } );
		stats.recordAction( 'fill_gap' );
		stats.recordGaEvent( 'Clicked Fill Gap' );
	}

} );

module.exports = Gap;
