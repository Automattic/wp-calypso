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
import FormLabel from 'components/forms/form-label';
import FormCheckbox from 'components/forms/form-checkbox';

export default React.createClass( {
	displayName: 'EditorPageParent',

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		siteId: PropTypes.number,
		parent: PropTypes.number,
		postId: PropTypes.number
	},

	updatePageParent( item ) {
		const parentId = item ? item.ID : null;
		postActions.edit( {
			parent: parentId
		} );
	},

	getEmptyMessage() {
		if ( this.props.postId ) {
			return this.translate( 'You have no other pages yet.' );
		}

		return this.translate( 'You have no pages yet.' );
	},

	render() {
		return (
			<AccordionSection className="editor-page-parent">
				<FormLabel>
					<span className="editor-page-parent__label-text">{ this.translate( 'Parent Page' ) }</span>
				</FormLabel>
				<FormLabel>
					<FormCheckbox ref="topLevel" checked={ ! this.props.parent } onChange={ this.updatePageParent } />
					{ this.translate( 'Top level page', { context: 'Categories: New category being created is top level i.e. has no parent' } ) }
				</FormLabel>
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
