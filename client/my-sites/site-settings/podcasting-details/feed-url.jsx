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
import ExternalLink from 'components/external-link';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import { getSupportSiteLocale } from '../../../lib/i18n-utils';

function PodcastFeedUrl( { feedUrl, translate } ) {
	const supportLink =
		'https://' + getSupportSiteLocale() + '.support.wordpress.com/audio/podcasting/';

	return (
		<FormFieldset>
			<FormLabel>{ translate( 'RSS Feed' ) }</FormLabel>
			<ClipboardButtonInput value={ feedUrl } />
			<FormSettingExplanation>
				{ translate(
					'Copy your feed URL and submit it to Apple Podcasts and other podcasting services. {{a}}Learn more{{/a}}',
					{
						components: {
							a: <ExternalLink href={ supportLink } target="_blank" icon iconSize={ 14 } />,
						},
					}
				) }
			</FormSettingExplanation>
		</FormFieldset>
	);
}

export default localize( PodcastFeedUrl );
