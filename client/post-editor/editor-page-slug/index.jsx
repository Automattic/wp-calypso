/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import pick from 'lodash/pick';

/**
 * Internal Dependencies
 */
import EditorSlug from 'post-editor/editor-slug';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'PostEditorPageSlug',

	mixins: [ PureRenderMixin ],

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
