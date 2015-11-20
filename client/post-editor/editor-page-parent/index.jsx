/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import AccordionSection from 'components/accordion/section';

/**
 * Internal dependencies
 */
import PostSelector from 'my-sites/post-selector';
import postActions from 'lib/posts/actions';

export default React.createClass( {
	displayName: 'EditorPageParent',

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		siteId: PropTypes.number,
		parent: PropTypes.number,
		postId: PropTypes.number
	},

	updatePageParent( item ) {
		postActions.edit( {
			parent: item.ID
		} );
	},

	getEmptyMessage() {
		if ( this.props.postId ) {
			return this.translate( 'You have no other pages yet.' );
		} else {
			return this.translate( 'You have no pages yet.' );
		}
	},

	render() {
		return (
			<AccordionSection className="editor-page-parent">
				<label>
					<span className="editor-page-parent__label-text">{ this.translate( 'Parent Page' ) }</span>
				</label>
				<PostSelector
					type="page"
					siteId={ this.props.siteId }
					onChange={ this.updatePageParent }
					selected={ this.props.parent }
					excludeTree={ this.props.postId }
					emptyMessage={ this.getEmptyMessage() }
				/>
			</AccordionSection>
		);
	}
} );
