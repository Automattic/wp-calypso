/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AccordionSection from 'components/accordion/section';
import FormLabel from 'components/forms/form-label';
import FormToggle from 'components/forms/form-toggle/compact';
import PostSelector from 'my-sites/post-selector';
import { getPostType } from 'state/post-types/selectors';
import { editPost } from 'state/posts/actions';
import { getEditedPostValue } from 'state/posts/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class EditorPageParent extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		parentId: PropTypes.number,
		postType: PropTypes.string,
		translate: PropTypes.func,
		labels: PropTypes.object
	};

	constructor( props ) {
		super( props );
		this.boundUpdatePageParent = this.updatePageParent.bind( this );
	}

	updatePageParent( item ) {
		const { siteId, postId } = this.props;
		const parentId = item && item.ID ? item.ID : null;
		this.props.editPost( siteId, postId, { parent: parentId } );
	}

	render() {
		const { parentId, translate, postId, siteId, postType, labels } = this.props;
		return (
			<AccordionSection className="editor-page-parent">
				<FormLabel>
					<span className="editor-page-parent__label-text">{ labels.parent || translate( 'Parent Page' ) }</span>
				</FormLabel>
				<FormLabel className="editor-page-parent__top-level">
					<span className="editor-page-parent__top-level-label">
						{ translate( 'Top level', { context: 'Editor: Page being edited is top level i.e. has no parent' } ) }
					</span>
					<FormToggle
						checked={ ! parentId }
						onChange={ this.boundUpdatePageParent }
						aria-label={ translate( 'Toggle to set as top level' ) }
					/>
				</FormLabel>
				<PostSelector
					type={ postType }
					siteId={ siteId }
					onChange={ this.boundUpdatePageParent }
					selected={ parentId }
					excludeTree={ postId }
					emptyMessage={ labels.not_found || translate( 'You have no other pages yet.' ) }
				/>
			</AccordionSection>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const postType = getEditedPostValue( state, siteId, postId, 'type' );
		const parent = getEditedPostValue( state, siteId, postId, 'parent' );
		const parentId = get( parent, 'ID', parent ) || 0;
		const labels = get( getPostType( state, siteId, postType ), 'labels', {} );

		return { siteId, postId, postType, parentId, labels };
	},
	{ editPost }
)( localize( EditorPageParent ) );
