/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import InfoPopover from 'components/info-popover';
import JetpackModuleToggle from '../jetpack-module-toggle';
import { getSelectedSiteId } from 'state/ui/selectors';

const JetpackMarkdown = ( {
	selectedSiteId,
	translate
} ) => {
	return (
		<FormFieldset className="composing__form-fieldset site-settings__has-divider is-top-only">
			<div className="composing__info-link-container site-settings__info-link-container">
				<InfoPopover position={ 'left' }>
					<ExternalLink href={ 'https://jetpack.com/support/markdown/' } target="_blank">
						{ translate( 'Learn more about Markdown.' ) }
					</ExternalLink>
				</InfoPopover>
			</div>
			<JetpackModuleToggle
				siteId={ selectedSiteId }
				moduleSlug="markdown"
				label={ translate( 'Write posts or pages in plain text Markdown syntax' ) }
				/>
		</FormFieldset>
	);
};

export default connect(
	( state ) => {
		return {
			selectedSiteId: getSelectedSiteId( state )
		};
	}
)( localize( JetpackMarkdown ) );
