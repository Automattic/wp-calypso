/**
 * External dependencies
 */
import React, { PropTypes } from 'react/addons';
import pick from 'lodash/object/pick';

/**
 * Internal Dependencies
 */
import EditorSlug from 'post-editor/editor-slug';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'PostEditorPageSlug',

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		path: PropTypes.string,
		slug: PropTypes.string
	},

	render() {
		return (
			<EditorSlug
				{ ...pick( this.props, 'path', 'slug' ) }
				instanceName="page-permalink"
			>
				<Gridicon icon="link" />
			</EditorSlug>
		);
	}
} );
