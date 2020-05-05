/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import PostSelector from 'my-sites/post-selector';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormToggle from 'components/forms/form-toggle/compact';
import AccordionSection from 'components/accordion/section';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { editPost } from 'state/posts/actions';
import { getPostType } from 'state/post-types/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class EditorPageParent extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		postId: PropTypes.number,
		parentId: PropTypes.number,
		postType: PropTypes.string,
		translate: PropTypes.func,
		labels: PropTypes.object,
	};

	state = {
		isTopLevel: ! this.props.parentId,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( this.props.parentId !== nextProps.parentId ) {
			this.setState( { isTopLevel: ! nextProps.parentId } );
		}
	}

	updatePageParent = ( item ) => {
		const { siteId, postId } = this.props;
		const parentId = get( item, 'ID' );

		if ( ! parentId ) {
			return this.setState(
				( { isTopLevel } ) => ( { isTopLevel: ! isTopLevel } ),
				() => {
					if ( this.state.isTopLevel ) {
						this.props.editPost( siteId, postId, { parent: 0 } );
					}
				}
			);
		}

		this.setState( { isTopLevel: false } );
		this.props.editPost( siteId, postId, { parent: parentId } );
	};

	render() {
		const { parentId, translate, postId, siteId, postType, labels } = this.props;
		const { isTopLevel } = this.state;

		return (
			<AccordionSection className="editor-page-parent">
				<FormLabel>
					<span className="editor-page-parent__label-text">
						{ labels.parent || translate( 'Parent Page' ) }
					</span>
				</FormLabel>
				<FormLabel className="editor-page-parent__top-level">
					<FormToggle
						checked={ isTopLevel }
						onChange={ this.updatePageParent }
						aria-label={ translate( 'Toggle to set as top level' ) }
					/>
					<span className="editor-page-parent__top-level-label">
						{ translate( 'Top level', {
							context: 'Editor: Page being edited is top level i.e. has no parent',
						} ) }
					</span>
					{ isTopLevel && (
						<span className="editor-page-parent__top-level-description">
							{ translate( 'Disable to select a parent page' ) }
						</span>
					) }
				</FormLabel>
				{ ! isTopLevel && (
					<div className="editor-page-parent__parent-tree-selector">
						<FormLegend>{ translate( 'Choose a parent page' ) }</FormLegend>
						<PostSelector
							type={ postType }
							siteId={ siteId }
							onChange={ this.updatePageParent }
							selected={ parentId }
							excludeTree={ postId }
							emptyMessage={ labels.not_found || translate( 'You have no other pages yet.' ) }
						/>
					</div>
				) }
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
