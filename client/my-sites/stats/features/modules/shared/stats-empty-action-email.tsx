import { mail } from '@automattic/components/src/icons';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import EmptyStateAction from '../../../components/empty-state-action';

type StatsEmptyActionEmailProps = {
	from: string;
};

// TODO: move to a shared file if this is the final URL
const JETPACK_SUPPORT_NEWSLETTER_URL = 'https://jetpack.com/support/newsletter';

const StatsEmptyActionEmail: React.FC< StatsEmptyActionEmailProps > = ( { from } ) => {
	const translate = useTranslate();

	return (
		<EmptyStateAction
			icon={ mail }
			text={ translate( 'Send emails with Newsletter' ) }
			analyticsDetails={ {
				from: from,
				feature: 'newsletter',
			} }
			onClick={ () => {
				// analytics event tracting handled in EmptyStateAction component

				setTimeout(
					() => ( window.location.href = localizeUrl( JETPACK_SUPPORT_NEWSLETTER_URL ) ),
					250
				);
			} }
		/>
	);
};

export default StatsEmptyActionEmail;
