/**
 * External dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

export default React.createClass( {

	displayName: 'EditorPostType',

	mixins: [ PureRenderMixin ],

	getDefaultProps() {
		return {
			isNew: false,
			type: 'post'
		};
	},

	propTypes: {
		isNew: React.PropTypes.bool,
		type: React.PropTypes.string
	},

	getLabel() {
		const { type, isNew } = this.props;

		if ( isNew ) {
			if ( type === 'page') {
				return this.translate( 'New Page' );
			} else {
				return this.translate( 'New Post' );
			}
		} else {
			if ( type === 'page' ) {
				return this.translate( 'Page', { context: 'noun' } );
			} else {
				return this.translate( 'Post', { context: 'noun' } );
			}
		}
	},

	render() {
		return (
			<span className="editor-post-type">
				{ this.getLabel() }
			</span>
		);
	}
} );
