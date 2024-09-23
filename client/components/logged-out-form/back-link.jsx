import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import safeProtocolUrl from 'calypso/lib/safe-protocol-url';

import './link-item.scss';

export default function LoggedOutFormBackLink( { locale, oauth2Client, recordClick, classes } ) {
	const translate = useTranslate();

	let url = localizeUrl( 'https://wordpress.com', locale );
	let message = translate( 'Back to WordPress.com' );

	if ( oauth2Client ) {
		url = safeProtocolUrl( oauth2Client.url );
		if ( ! url || url === 'http:' ) {
			return null;
		}

		message = translate( 'Back to %(clientTitle)s', {
			args: {
				clientTitle: oauth2Client.title,
			},
		} );
	}

	return (
		<a
			href={ url }
			key="return-to-wpcom-link"
			onClick={ recordClick }
			rel="external"
			className={ clsx( {
				'logged-out-form__link-item': true,
				'logged-out-form__back-link': true,
				...classes,
			} ) }
		>
			<Gridicon icon="arrow-left" size={ 18 } />
			{ message }
		</a>
	);
}

LoggedOutFormBackLink.propTypes = {
	classes: PropTypes.object,
	locale: PropTypes.string,
	recordClick: PropTypes.func.isRequired,
	oauth2Client: PropTypes.object,
};
