/**
 * External dependencies
 */
var React = require( 'react' ),
	joinClasses = require( 'react/lib/joinClasses' ),
	classNames = require( 'classnames' );

module.exports = React.createClass( {
	displayName: 'ProgressIndicator',

	getDefaultProps: function() {
		return {
			status: 'inactive'
		};
	},

	propTypes: {
		status: React.PropTypes.string
	},

	render: function() {
		var last = null,
			status = this.props.status,
			classes;

		if ( 'failed' === status ) {
			last = ( <div className="is-problem" /> );
		} else if ( 'success' === status ) {
			last = ( <div className="is-success" /> );
		}

		classes = classNames( {
			'progress-indicator': true,
			'is-in-progress': 'in-progress' === status,
			'is-processing': 'processing' === status,
			'is-complete': 'success' === status || 'complete' === status,
			'is-inactive': 'inactive' === status
		} );

		return (
			<div className={ joinClasses( this.props.className, classes ) }>
				<div className="progress-indicator__half" />
				<div className="progress-indicator__half is-latter" />
				{ last }
			</div>
		);
	}
} );
