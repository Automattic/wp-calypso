/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import AccordionSection from 'components/accordion/section';
import Button from 'components/button';
import Gridicon from 'components/gridicon';
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
		};
	}

	setPostToCopy = post => {
		this.setState( {
			selectedPostID: post.ID,
		} );
	}

	goToNewDraft = () => {
		if ( '' !== this.state.selectedPostID ) {
			page.redirect( `/post/${ this.props.site.slug }/${ this.state.selectedPostID }?copy=true` );
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
						emptyMessage={ translate( 'No posts found' ) }
						orderBy="date"
						order="DESC"
						onChange={ this.setPostToCopy }
						selected={ this.state.selectedPostID }
					/>
					<Button
						disabled={ ! this.state.selectedPostID }
						onClick={ this.goToNewDraft }
					>
						{ translate( 'Copy' ) }
					</Button>
				</AccordionSection>
			</Accordion>
		);
	}

}

export default localize( EditorDrawerCopyPost );
