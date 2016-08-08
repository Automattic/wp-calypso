/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
import PostActions from 'lib/posts/actions';
import PostSelector from 'my-sites/post-selector';

module.exports = React.createClass( {
	displayName: 'EditorCopyPost',

	propTypes: {
		site: React.PropTypes.object,
		post: React.PropTypes.object,
	},

	getInitialState: function() {
		return {
			selectedPostID: '',
			postCopy: {},
		};
	},

	getTitle: function() {
		return this.translate( 'Copy Post' );
	},

	getDescription: function() {
		return this.translate( 'Use an existing post as a template.' );
	},

	getSubmitText: function() {
		return this.translate( 'Use selected post as template' );
	},

	setPostCopy: function( post ) {
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
	},

	updateCurrentPost: function() {
		if ( ! isEmpty( this.state.postCopy ) ) {
			PostActions.edit( this.state.postCopy );
			//PostActions.editRawContent( this.state.postCopy.content );
		}
	},

	render: function() {
		const classes = classNames( 'editor-drawer__accordion' );
		return (
			<Accordion
				title={ this.getTitle() }
				icon={ <Gridicon icon="aside" /> }
				className={ classes }
			>
				<AccordionSection>
					<p className="editor-drawer__description">
						{ this.getDescription() }
					</p>
					<PostSelector
						siteId={ this.props.site.ID }
						showTypeLabels={ true }
						emptyMessage={ this.translate( 'No posts found' ) }
						onChange={ this.setPostCopy }
						selected={ this.state.selectedPostID }
					/>
					<Button
						disabled={ ! this.state.selectedPostID }
						onClick={ this.updateCurrentPost }
					>
						{ this.getSubmitText() }
					</Button>
				</AccordionSection>
			</Accordion>
		);
	},
} );
