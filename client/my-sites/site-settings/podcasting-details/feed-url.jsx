/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ClipboardButtonInput from 'calypso/components/clipboard-button-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import PodcastingSupportLink from './support-link';
import { getTerm } from 'calypso/state/terms/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';

function PodcastFeedUrl( { feedUrl, translate } ) {
	if ( ! feedUrl ) {
		return null;
	}

	return (
		<FormFieldset>
			<FormLabel>{ translate( 'RSS Feed' ) }</FormLabel>
			<ClipboardButtonInput value={ feedUrl } />
			<FormSettingExplanation>
				{ translate(
					'Copy your feed URL and submit it to Apple Podcasts and other podcasting services.'
				) }{ ' ' }
				<PodcastingSupportLink />
			</FormSettingExplanation>
		</FormFieldset>
	);
}

export default connect( ( state, ownProps ) => {
	const { categoryId } = ownProps;

	const siteId = getSelectedSiteId( state );

	const podcastingCategory = categoryId && getTerm( state, siteId, 'category', categoryId );

	let feedUrl = podcastingCategory && podcastingCategory.feed_url;

	if ( feedUrl && ! isJetpackSite( state, siteId ) ) {
		// Feed URLs for WP.com Simple sites may incorrectly show up as http:
		feedUrl = feedUrl.replace( /^http:/, 'https:' );
	}

	return { feedUrl };
} )( localize( PodcastFeedUrl ) );
