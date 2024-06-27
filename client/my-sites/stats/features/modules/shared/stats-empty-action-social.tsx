import { localizeUrl } from '@automattic/i18n-utils';
import { megaphone } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyStateAction from '../../../components/empty-state-action';

type StatsEmptyActionSocialProps = {
	from: string;
};

// TODO: move to a shared file if this is the final URL
const JETPACK_SUPPORT_SOCIAL_URL = 'https://jetpack.com/support/jetpack-social/';

const StatsEmptyActionSocial: React.FC< StatsEmptyActionSocialProps > = ( { from } ) => {
	const translate = useTranslate();
	return (
		<EmptyStateAction
			icon={ megaphone }
			text={ translate( 'Share on social media with one click' ) }
			analyticsDetails={ {
				from: from,
				feature: 'social_sharing',
			} }
			onClick={ () => {
				// analytics event tracting handled in EmptyStateAction component

				setTimeout(
					() => ( window.location.href = localizeUrl( JETPACK_SUPPORT_SOCIAL_URL ) ),
					250
				);
			} }
		/>
	);
};

export default StatsEmptyActionSocial;
