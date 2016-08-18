/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';

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
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
		translate: PropTypes.func,
	};

	constructor() {
		super( ...arguments );
		this.state = this.resetState();
	}

	resetState() {
		return {
			selectedPostId: null,
			showDialog: false,
		};
	}

	openDialog = event => {
		event.preventDefault();

		this.setState( {
			showDialog: true,
		} );
	}

	closeDialog = () => {
		this.setState( this.resetState() );
	}

	setPostToCopy = post => {
		this.setState( {
			selectedPostId: post.ID,
		} );
	}

	goToNewDraft = () => {
		if ( '' !== this.state.selectedPostId ) {
			page.redirect( `/post/${ this.props.siteSlug }?copy=${ this.state.selectedPostId }` );
			this.closeDialog();
		}
	}

	render() {
		const { translate, siteId } = this.props;
		const buttons = [ {
			action: 'cancel',
			label: translate( 'Cancel' ),
		}, {
			action: 'copy',
			label: translate( 'Overwrite' ),
			isPrimary: true,
			disabled: ! this.state.selectedPostId,
			onClick: this.goToNewDraft,
		} ];
		return (
			<AccordionSection className="editor-more-options__copy-post">
				<EditorDrawerLabel
					labelText={ translate( 'Copy Post' ) }
					helpText={ translate( "Pick a post and we'll copy the title, content, tags and categories. " ) }
				>
					<Button borderless compact onClick={ this.openDialog }>
						<Gridicon icon="clipboard" /> { translate( 'Select a post to copy' ) }
					</Button>
				</EditorDrawerLabel>
				<Dialog
					autoFocus={ false }
					isVisible={ this.state.showDialog }
					buttons={ buttons }
					onClose={ this.closeDialog }
					additionalClassNames="editor-more-options__copy-post-select-dialog"
				>
					<FormSectionHeading>
						{ translate( 'Select a post to copy' ) }
					</FormSectionHeading>
					<p>
						{ translate( "Pick a post and we'll copy the title, content, tags and categories. " ) }
					</p>
					<PostSelector
						siteId={ siteId }
						emptyMessage={ translate( 'No posts found' ) }
						orderBy="date"
						order="DESC"
						onChange={ this.setPostToCopy }
						selected={ this.state.selectedPostId }
					/>
				</Dialog>
			</AccordionSection>
		);
	}

}

export default connect( state => ( {
	siteId: getSelectedSiteId( state ),
	siteSlug: getSiteSlug( state, getSelectedSiteId( state ) ),
} ) )( localize( EditorMoreOptionsCopyPost ) );
