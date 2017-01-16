/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { capitalize } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import AccordionSection from 'components/accordion/section';
import Button from 'components/button';
import Dialog from 'components/dialog';
import EditorDrawerLabel from 'post-editor/editor-drawer/label';
import FormSectionHeading from 'components/forms/form-section-heading';
import Gridicon from 'components/gridicon';
import PostSelector from 'my-sites/post-selector';

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

	openDialog = event => {
		event.preventDefault();
		this.setState( {
			showDialog: true,
		} );
	}

	closeDialog = () => {
		this.setState( {
			selectedPostId: null,
			showDialog: false,
		} );
	}

	setPostToCopy = post => {
		this.setState( {
			selectedPostId: post.ID,
		} );
	}

	goToNewDraft = () => {
		const { siteSlug, type } = this.props;
		const { selectedPostId } = this.state;
		if ( '' !== selectedPostId ) {
			page.redirect( `/${ type }/${ siteSlug }?copy=${ selectedPostId }` );
			this.closeDialog();
		}
	}

	render() {
		const { siteId, translate, type } = this.props;
		const { selectedPostId, showDialog } = this.state;
		const buttons = [ {
			action: 'cancel',
			label: translate( 'Cancel' ),
		}, {
			action: 'copy',
			label: translate( 'Overwrite' ),
			isPrimary: true,
			disabled: ! selectedPostId,
			onClick: this.goToNewDraft,
		} ];

		return (
			<AccordionSection className="editor-more-options__copy-post">
				<EditorDrawerLabel
					labelText={ translate( 'Copy %s', { args: capitalize( type ), comment: '"Post" or "Page"' } ) }
					helpText={ translate(
						"Pick a %s and we'll copy the title, content, tags and categories.",
						{ args: type, comment: '"post" or "page"' }
					) }
				>
					<Button borderless compact onClick={ this.openDialog }>
						<Gridicon icon="clipboard" />
						{ translate( 'Select a %s to copy', { args: type, comment: '"post" or "page"' } ) }
					</Button>
				</EditorDrawerLabel>
				<Dialog
					autoFocus={ false }
					isVisible={ showDialog }
					buttons={ buttons }
					onClose={ this.closeDialog }
					additionalClassNames="editor-more-options__copy-post-select-dialog"
				>
					<FormSectionHeading>
						{ translate( 'Select a %s to copy', { args: type, comment: '"post" or "page"' } ) }
					</FormSectionHeading>
					<p>
						{ translate(
							"Pick a %s and we'll copy the title, content, tags and categories.",
							{ args: type, comment: '"post" or "page"' }
						) }
					</p>
					{ siteId &&
						<PostSelector
							emptyMessage={ 'post' === type ? translate( 'No posts found' ) : translate( 'No pages found' ) }
							onChange={ this.setPostToCopy }
							order="DESC"
							orderBy="date"
							selected={ selectedPostId }
							siteId={ siteId }
							type={ type }
						/>
					}
				</Dialog>
			</AccordionSection>
		);
	}

}

export default connect( state => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		siteSlug: getSiteSlug( state, siteId ),
	};
} )( localize( EditorMoreOptionsCopyPost ) );
