/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import SettingsSectionHeader from 'my-sites/site-settings/settings-section-header';
import { getSelectedSiteId } from 'state/ui/selectors';
import { localizeUrl } from 'lib/i18n-utils';

/**
 * Style dependencies
 */
import './style.scss';

class FeedSettings extends Component {
	render() {
		const {
			fields,
			handleSubmitForm,
			handleToggle,
			isRequestingSettings,
			isSavingSettings,
			onChangeField,
			translate,
		} = this.props;

		const isDisabled = isRequestingSettings || isSavingSettings;

		if ( 'undefined' === typeof fields.posts_per_rss ) {
			// Do not allow these settings to be updated if they cannot be read from the API.
			return null;
		}

		return (
			<div className="feed-settings">
				<SettingsSectionHeader
					disabled={ isDisabled }
					isSaving={ isSavingSettings }
					onButtonClick={ handleSubmitForm }
					showButton
					title={ translate( 'Feed Settings' ) }
				/>
				<CompactCard>
					<FormFieldset>
						{ translate( 'Display {{field /}} most recent blog posts', {
							components: {
								field: (
									<FormTextInput
										name="posts_per_rss"
										type="number"
										step="1"
										min="0"
										id="posts_per_rss"
										value={ fields.posts_per_rss }
										onChange={ onChangeField( 'posts_per_rss' ) }
										disabled={ isDisabled }
									/>
								),
							},
						} ) }
						<FormSettingExplanation>
							{ translate(
								"The number of posts to include in your site's feed. {{link}}Learn more about feeds{{/link}}",
								{
									components: {
										link: <a href={ localizeUrl( 'https://wordpress.com/support/feeds/' ) } />,
									},
								}
							) }
						</FormSettingExplanation>
					</FormFieldset>
					<CompactFormToggle
						checked={ !! fields.rss_use_excerpt }
						disabled={ isDisabled }
						onChange={ handleToggle( 'rss_use_excerpt' ) }
					>
						{ translate( 'Limit feed to excerpt only' ) }
					</CompactFormToggle>
					<FormSettingExplanation isIndented className="feed-settings__excerpt-explanation">
						{ translate(
							'Enable this to include only an excerpt of your content. ' +
								'Users will need to visit your site to view the full content.'
						) }
					</FormSettingExplanation>
				</CompactCard>
			</div>
		);
	}
}

export default connect( ( state ) => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		selectedSiteId,
	};
} )( localize( FeedSettings ) );
