/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { localizeUrl } from 'calypso/lib/i18n-utils';
import safeProtocolUrl from 'calypso/lib/safe-protocol-url';
import Gridicon from 'calypso/components/gridicon';

/**
 * Style dependencies
 */
import './link-item.scss';

function LoggedOutFormBackLink( props ) {
	const { locale, oauth2Client, translate, recordClick } = props;

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
			className={ classnames( {
				'logged-out-form__link-item': true,
				'logged-out-form__back-link': true,
				...props.classes,
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
	translate: PropTypes.func.isRequired,
	recordClick: PropTypes.func.isRequired,
	oauth2Client: PropTypes.object,
};

export default localize( LoggedOutFormBackLink );
