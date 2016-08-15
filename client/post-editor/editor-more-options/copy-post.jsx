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
import { getSelectedSite } from 'state/ui/selectors';
import AccordionSection from 'components/accordion/section';
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormSectionHeading from 'components/forms/form-section-heading';
import Gridicon from 'components/gridicon';
import InfoPopover from 'components/info-popover';
import PostSelector from 'my-sites/post-selector';

class EditorMoreOptionsCopyPost extends Component {

	static propTypes = {
		site: PropTypes.object.isRequired,
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
			page.redirect( `/post/${ this.props.site.slug }?copy=${ this.state.selectedPostId }` );
			this.closeDialog();
		}
	}

	render() {
		const { translate, site } = this.props;
		const buttons = [ {
			action: 'cancel',
			label: translate( 'Cancel' ),
		}, {
			action: 'copy',
			label: translate( 'Copy' ),
			isPrimary: true,
			disabled: ! this.state.selectedPostId,
			onClick: this.goToNewDraft,
		} ];
		return (
			<AccordionSection className="editor-more-options__copy-post">
				<div className="editor-drawer__label-text">
					{ translate( 'Copy Post' ) }
					<InfoPopover position="top left">
						{ translate( "Pick a post and we'll copy the title, content, tags and categories. " ) }
					</InfoPopover>
				</div>
				<Button borderless compact={ true } onClick={ this.openDialog }>
					<Gridicon icon="aside" /> { translate( 'Select a post to copy' ) }
				</Button>
				<Dialog
					autoFocus={ false }
					isVisible={ this.state.showDialog }
					buttons={ buttons }
					onClose={ this.closeDialog }
					additionalClassNames="copy-post__select-post-dialog"
				>
					<FormSectionHeading>
						{ translate( 'Select a post to copy' ) }
					</FormSectionHeading>
					<p>
						{ translate( "Pick a post and we'll copy the title, content, tags and categories. " ) }
						<br />
						{ translate( 'Recent posts are listed below. Search by title to find older posts.' ) }
					</p>
					<PostSelector
						siteId={ site.ID }
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
	site: getSelectedSite( state )
} ) )( localize( EditorMoreOptionsCopyPost ) );
