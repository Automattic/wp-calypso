/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';
import Gridicon from 'gridicons';

export default React.createClass( {
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
			return (
				<div className="progress-indicator is-complete">
					<Gridicon icon="checkmark" size={ 18 } />
				</div>
			);
		}

		classes = classnames( this.props.className, {
			'progress-indicator': true,
			'is-in-progress': 'in-progress' === status,
			'is-processing': 'processing' === status,
			'is-complete': 'success' === status || 'complete' === status,
			'is-inactive': 'inactive' === status
		} );

		return (
			<div className={ classes }>
				<div className="progress-indicator__half" />
				<div className="progress-indicator__half is-latter" />
				{ last }
			</div>
		);
	}
} );
