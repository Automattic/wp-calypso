/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { getEditorLastDraftPost } from 'state/ui/editor/last-draft/selectors';
import { decodeEntities } from 'lib/formatting';

const ResumeEditing = React.createClass( {
	propTypes: {
		draft: PropTypes.object
	},

	render: function() {
		const { draft } = this.props;
		if ( ! draft ) {
			return null;
		}

		return (
			<div className="resume-editing">
				<span className="resume-editing__label">{ this.translate( 'Continue Editing' ) }</span>
				<span className="resume-editing__post-title">{ decodeEntities( draft.title ) }</span>
			</div>
		);
	}
} );

export default connect( ( state ) => {
	return {
		draft: getEditorLastDraftPost( state )
	};
} )( ResumeEditing );
