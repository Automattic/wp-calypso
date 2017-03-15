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
import { isJetpackModuleActive, isActivatingJetpackModule } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { activateModule } from 'state/jetpack/modules/actions';

class CommentDisplaySettings extends Component {
	componentDidUpdate() {
		const {
			isActivatingMarkdownModule,
			isMarkdownModuleActive,
			fields,
			siteId
		} = this.props;

		if ( isMarkdownModuleActive !== false ) {
			return;
		}

		if ( ! fields.wpcom_publish_comments_with_markdown ) {
			return;
		}

		if ( isActivatingMarkdownModule ) {
			return;
		}

		this.props.activateModule( siteId, 'markdown', true );
	}

	isFormPending() {
		const {
			isRequestingSettings,
			isSavingSettings,
		} = this.props;

		return isRequestingSettings || isSavingSettings;
	}

	render() {
		const {
			fields,
			handleToggle,
			translate,
		} = this.props;

		return (
			<div className="comment-markdown-toggle">
				<div className="comment-markdown-toggle__info-link-container">
					<InfoPopover position={ 'left' }>
						<ExternalLink href="http://en.support.wordpress.com/markdown-quick-reference/" target="_blank">
							{ this.props.translate( 'Learn more about Markdown' ) }
						</ExternalLink>
					</InfoPopover>
				</div>
				<CompactFormToggle
					checked={ !! fields.wpcom_publish_comments_with_markdown }
					disabled={ this.isFormPending() }
					onChange={ handleToggle( 'wpcom_publish_comments_with_markdown' ) }>
					<span>{ translate( 'Enable Markdown for comments.' ) }</span>
				</CompactFormToggle>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );

		return {
			siteId,
			isMarkdownModuleActive: isJetpackModuleActive( state, siteId, 'markdown' ),
			isActivatingMarkdownModule: isActivatingJetpackModule( state, siteId, 'markdown' ),
		};
	},
	{
		activateModule
	}
)( localize( CommentDisplaySettings ) );
