/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditedPostValue } from 'state/posts/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import AccordionSection from 'components/accordion/section';
import { Button, Dialog } from '@automattic/components';
import EditorDrawerLabel from 'post-editor/editor-drawer/label';
import FormSectionHeading from 'components/forms/form-section-heading';
import PostSelector from 'my-sites/post-selector';

/**
 * Style dependencies
 */
import './copy-post.scss';

class EditorMoreOptionsCopyPost extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		translate: PropTypes.func,
		type: PropTypes.oneOf( [ 'page', 'post' ] ).isRequired,
	};

	state = {
		selectedPostId: null,
		showDialog: false,
	};

	isPost = () => 'post' === this.props.type;

	openDialog = () => {
		this.setState( {
			showDialog: true,
		} );
	};

	closeDialog = () => {
		this.setState( {
			selectedPostId: null,
			showDialog: false,
		} );
	};

	setPostToCopy = ( post ) => {
		this.setState( {
			selectedPostId: post.ID,
		} );
	};

	goToNewDraft = () => {
		const { siteSlug, type } = this.props;
		const { selectedPostId } = this.state;
		if ( '' !== selectedPostId ) {
			page.redirect( `/${ type }/${ siteSlug }?jetpack-copy=${ selectedPostId }` );
			this.closeDialog();
		}
	};

	render() {
		const { siteId, translate, type } = this.props;
		const { selectedPostId, showDialog } = this.state;
		const buttons = [
			{
				action: 'cancel',
				label: translate( 'Cancel' ),
			},
			{
				action: 'copy',
				label: translate( 'Overwrite' ),
				isPrimary: true,
				disabled: ! selectedPostId,
				onClick: this.goToNewDraft,
			},
		];

		return (
			<AccordionSection className="editor-more-options__copy-post">
				<EditorDrawerLabel
					labelText={ this.isPost() ? translate( 'Copy Post' ) : translate( 'Copy Page' ) }
					helpText={
						this.isPost()
							? translate( "Pick a post and we'll copy the title, content, tags and categories." )
							: translate( "Pick a page and we'll copy the title and content." )
					}
				/>
				<Button borderless compact onClick={ this.openDialog }>
					<Gridicon icon="clipboard" />
					{ this.isPost()
						? translate( 'Select a post to copy' )
						: translate( 'Select a page to copy' ) }
				</Button>
				<Dialog
					isVisible={ showDialog }
					buttons={ buttons }
					onClose={ this.closeDialog }
					additionalClassNames="editor-more-options__copy-post-select-dialog"
				>
					<FormSectionHeading>
						{ this.isPost()
							? translate( 'Select a post to copy' )
							: translate( 'Select a page to copy' ) }
					</FormSectionHeading>
					<p>
						{ this.isPost()
							? translate( "Pick a post and we'll copy the title, content, tags and categories." )
							: translate( "Pick a page and we'll copy the title and content." ) }
					</p>
					{ siteId && (
						<PostSelector
							emptyMessage={
								this.isPost() ? translate( 'No posts found' ) : translate( 'No pages found' )
							}
							onChange={ this.setPostToCopy }
							order="DESC"
							orderBy="date"
							selected={ selectedPostId }
							siteId={ siteId }
							status="draft,future,pending,private,publish"
							type={ type }
						/>
					) }
				</Dialog>
			</AccordionSection>
		);
	}
}

export default connect( ( state ) => {
	const postId = getEditorPostId( state );
	const siteId = getSelectedSiteId( state );
	const type = getEditedPostValue( state, siteId, postId, 'type' );

	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
		type,
	};
} )( localize( EditorMoreOptionsCopyPost ) );
