/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */

const ResumeEditing = React.createClass( {
	render: function() {
		return (
			<div className="resume-editing">
				<span className="resume-editing__label">{ this.translate( 'Continue Editing' ) }</span>
				<span className="resume-editing__post-title">My Post</span>
			</div>
		);
	}
} );

export default ResumeEditing;
