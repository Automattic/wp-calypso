/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { cloneDeep, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import PostActions from 'lib/posts/actions';
import PostSelector from 'my-sites/post-selector';

class EditorDrawerCopyPost extends Component {

	static propTypes = {
		site: PropTypes.object.isRequired,
		post: PropTypes.object.isRequired,
		translate: PropTypes.func,
	};

	constructor() {
		super( ...arguments );
		this.state = {
			selectedPostID: '',
			postCopy: {},
		};
	}

	setPostCopy = post => {
		const postCopy = {
			categories: cloneDeep( post.categories ),
			//content: post.content,
			excerpt: post.excerpt,
			tags: cloneDeep( post.tags ),
			title: post.title,
		};
		if ( post.attachment_count ) {
			postCopy.attachments = cloneDeep( post.attachments );
			postCopy.attachment_count = post.attachment_count;
		}
		if ( post.canonical_image ) {
			postCopy.canonical_image = cloneDeep( post.canonical_image );
		}
		if ( post.featured_image ) {
			postCopy.featured_image = post.featured_image;
		}
		if ( post.format ) {
			postCopy.format = post.format;
		}
		if ( post.metadata ) {
			postCopy.metadata = cloneDeep( post.metadata );
		}
		if ( post.post_thumbnail ) {
			postCopy.post_thumbnail = cloneDeep( post.post_thumbnail );
		}

		this.setState( {
			selectedPostID: post.ID,
			postCopy: postCopy,
		} );
	}

	updateCurrentPost = () => {
		if ( ! isEmpty( this.state.postCopy ) ) {
			PostActions.edit( this.state.postCopy );
			//PostActions.editRawContent( this.state.postCopy.content );
		}
	}

	render() {
		const { translate, site } = this.props;
		return (
			<Accordion
				title={ translate( 'Copy a Post' ) }
				subtitle={ translate( 'Use an existing post as a template.' ) }
				icon={ <Gridicon icon="aside" /> }
				className="editor-drawer__copy-post"
			>
				<AccordionSection>
					<p className="editor-drawer__description">
						{ translate(
							"Pick a post and we'll copy the title, content, tags and categories. " +
							'Recent posts are listed below. ' +
							'Search by title to find older posts.'
						) }
					</p>
					<PostSelector
						siteId={ site.ID }
						showTypeLabels={ true }
						emptyMessage={ translate( 'No posts found' ) }
						onChange={ this.setPostCopy }
						selected={ this.state.selectedPostID }
					/>
					<Button
						disabled={ ! this.state.selectedPostID }
						onClick={ this.updateCurrentPost }
					>
						{ translate( 'Copy' ) }
					</Button>
				</AccordionSection>
			</Accordion>
		);
	}

}

export default localize( EditorDrawerCopyPost );
