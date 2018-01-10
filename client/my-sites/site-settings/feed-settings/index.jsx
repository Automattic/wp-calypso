/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */

import Button from 'components/button';
import CompactCard from 'components/card/compact';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormFieldset from 'components/forms/form-fieldset';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import SectionHeader from 'components/section-header';
import { getSelectedSiteId } from 'state/ui/selectors';

class FeedSettings extends Component {
	render() {
		const {
			fields,
			handleSubmitForm,
			handleToggle,
			isSavingSettings,
			onChangeField,
			translate,
		} = this.props;

		return (
			<div className="feed-settings">
				<SectionHeader label={ translate( 'Syndication Feeds (RSS)' ) }>
					<Button compact primary disabled={ false } onClick={ handleSubmitForm }>
						{ isSavingSettings ? translate( 'Saving…' ) : translate( 'Save Settings' ) }
					</Button>
				</SectionHeader>
				<CompactCard>
					<FormFieldset>
						{ translate( 'Show the {{field /}} most recent items', {
							components: {
								field: (
									<FormTextInput
										name="posts_per_rss"
										type="number"
										step="1"
										min="0"
										id="posts_per_rss"
										value={
											'undefined' === typeof fields.posts_per_rss ? 10 : fields.posts_per_rss
										}
										onChange={ onChangeField( 'posts_per_rss' ) }
										disabled={ false }
									/>
								),
							},
						} ) }
						<FormSettingExplanation>
							{ translate( 'In syndication feeds, the number of items to show.' ) }
						</FormSettingExplanation>
					</FormFieldset>
					<CompactFormToggle
						checked={ !! fields.rss_use_excerpt }
						disabled={ false }
						onChange={ handleToggle( 'rss_use_excerpt' ) }
					>
						{ translate( 'Use excerpts in the feed' ) }
					</CompactFormToggle>
					<FormSettingExplanation isIndented>
						When an excerpt is available for your content, it will be used instead of the full text.
					</FormSettingExplanation>
				</CompactCard>
			</div>
		);
	}
}

export default connect( state => {
	const selectedSiteId = getSelectedSiteId( state );

	return {
		selectedSiteId,
	};
} )( localize( FeedSettings ) );
