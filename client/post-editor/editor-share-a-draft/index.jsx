/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import FormToggle from 'components/forms/form-toggle';
import FormTextInputWithAction from 'components/forms/form-text-input-with-action';
import { getDraftSharing } from 'state/selectors';
import { enableDraftSharing, disableDraftSharing } from 'state/draft-sharing/actions';

export class EditorShareADraft extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
		// Expose copySelection as a prop to facilitate unit test
		copySelection: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		postId: PropTypes.number,
		isEnabled: PropTypes.bool.isRequired,
		link: PropTypes.string.isRequired,
		enableDraftSharing: PropTypes.func.isRequired,
		disableDraftSharing: PropTypes.func.isRequired,
	};

	static defaultProps = {
		copySelection: () => document.execCommand( 'copy' ),
	};

	saveLinkInputRef = linkInput => ( this.linkInputNode = linkInput.refs.textField );
	onCopy = () => {
		this.linkInputNode.select();
		this.props.copySelection();
	};

	onToggleSharing = shouldEnable => {
		const { siteId, postId } = this.props;
		shouldEnable
			? this.props.enableDraftSharing( siteId, postId )
			: this.props.disableDraftSharing( siteId, postId );
	};

	render() {
		const { translate, postId, isEnabled, link } = this.props;
		const hasPostId = postId !== null;

		return (
			<Accordion className="editor-share-a-draft" title={ translate( 'Share a Draft' ) }>
				<p>
					{ translate(
						'Enable draft sharing and we’ll create a public link to your draft, ' +
							'so you can ask a trusted reader for feedback before you publish.',
					) }
				</p>
				<FormToggle checked={ hasPostId && isEnabled } disabled={ ! hasPostId } onChange={ this.onToggleSharing }>
					{ translate( 'Enable draft sharing' ) }
				</FormToggle>
				<FormTextInputWithAction
					readOnly
					defaultValue={ link }
					action={ translate( 'Copy', { context: 'verb' } ) }
					inputRef={ this.saveLinkInputRef }
					onAction={ this.onCopy }
				/>
			</Accordion>
		);
	}
}

export default connect(
	( state, { siteId, postId } ) => getDraftSharing( state, siteId, postId ),
	{
		enableDraftSharing,
		disableDraftSharing,
	},
)( localize( EditorShareADraft ) );
