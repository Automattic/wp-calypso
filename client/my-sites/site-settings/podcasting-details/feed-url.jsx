/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ClipboardButtonInput from 'components/clipboard-button-input';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import PodcastingSupportLink from './support-link';

function PodcastFeedUrl( { feedUrl, translate } ) {
	return (
		<FormFieldset>
			<FormLabel>{ translate( 'RSS Feed' ) }</FormLabel>
			<ClipboardButtonInput value={ feedUrl } />
			<FormSettingExplanation>
				{ translate(
					'Copy your feed URL and submit it to Apple Podcasts and other podcasting services.'
				) }{' '}
				<PodcastingSupportLink />
			</FormSettingExplanation>
		</FormFieldset>
	);
}

export default localize( PodcastFeedUrl );
