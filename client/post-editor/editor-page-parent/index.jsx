/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import AccordionSection from 'components/accordion/section';
/**
 * Internal dependencies
 */
import PostSelector from 'my-sites/post-selector';
import postActions from 'lib/posts/actions';
import FormLabel from 'components/forms/form-label';
import FormToggle from 'components/forms/form-toggle/compact';

export default React.createClass( {
	displayName: 'EditorPageParent',

	mixins: [ PureRenderMixin ],

	propTypes: {
		siteId: PropTypes.number,
		parent: PropTypes.number,
		postId: PropTypes.number
	},

	updatePageParent( item ) {
		const parentId = item && item.ID ? item.ID : null;
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
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
				<FormLabel className="editor-page-parent__top-level">
					<span className="editor-page-parent__top-level-label">
						{ this.translate( 'Top level page', { context: 'Editor: Page being edited is top level i.e. has no parent' } ) }
					</span>
					<FormToggle
						checked={ ! this.props.parent }
						onChange={ this.updatePageParent }
						aria-label={ this.translate( 'Toggle to set page as top level' ) }
					/>
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
