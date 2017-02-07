/**
* External dependencies
*/
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactFormToggle from 'components/forms/form-toggle/compact';
import ExternalLink from 'components/external-link';
import InfoPopover from 'components/info-popover';
import { isJetpackModuleActive } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

class CommentDisplaySettings extends Component {
	shouldEnableSettings() {
		const { isMarkdownModuleActive, submittingForm } = this.props;
		return !! submittingForm || ! isMarkdownModuleActive;
	}

	render() {
		const {
			fields,
			handleToggle,
			translate,
		} = this.props;

		return (
			<div className="markdown-toggle">
				<div className="markdown-toggle__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink href="http://en.support.wordpress.com/markdown-quick-reference/" target="_blank">
							{ this.props.translate( 'Learn more about markdown' ) }
						</ExternalLink>
					</InfoPopover>
				</div>
				<CompactFormToggle
					checked={ !! fields.wpcom_publish_comments_with_markdown }
					disabled={ this.shouldEnableSettings() }
					onChange={ handleToggle( 'wpcom_publish_comments_with_markdown' ) }>
					<span>{ translate( 'Enable Markdown for comments.' ) }</span>
				</CompactFormToggle>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			selectedSiteId,
			isMarkdownModuleActive: !! isJetpackModuleActive( state, selectedSiteId, 'markdown' ),
		};
	}
)( localize( CommentDisplaySettings ) );
