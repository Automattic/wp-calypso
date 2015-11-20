/**
 * External dependencies
 */
var React = require( 'react' ),
	joinClasses = require( 'react/lib/joinClasses' );

module.exports = React.createClass( {

	displayName: 'ProgressBar',

	getDefaultProps: function() {
		return { total: 100 };
	},

	propTypes: {
		value: React.PropTypes.number.isRequired,
		total: React.PropTypes.number,
		color: React.PropTypes.string,
		title: React.PropTypes.string,
		className: React.PropTypes.string
	},

	renderBar: function() {
		var styles = { width: Math.ceil( this.props.value / this.props.total * 100 ) + '%' },
			title = this.props.title
				? <span className="screen-reader-text">{ this.props.title }</span>
				: null;

		if ( this.props.color ) {
			styles.backgroundColor = this.props.color;
		}

		return <div className="progress-bar__progress" style={ styles } >{ title }</div>;
	},

	render: function() {
		return (
			<div className={ joinClasses( this.props.className, 'progress-bar' ) }>
				{ this.renderBar() }
			</div>
		);
	}
} );
