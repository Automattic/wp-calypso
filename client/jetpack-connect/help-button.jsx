/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'components/gridicon';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import LoggedOutFormLinkItem from 'components/logged-out-form/link-item';
import { recordTracksEvent } from 'state/analytics/actions';

export default function JetpackConnectHelpButton( { label, url } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const recordClick = React.useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jpc_help_link_click' ) );
	}, [ dispatch ] );

	return (
		<LoggedOutFormLinkItem
			className="jetpack-connect__help-button"
			href={ url || 'https://jetpack.com/contact-support' }
			target="_blank"
			rel="noopener noreferrer"
			onClick={ recordClick }
		>
			<Gridicon icon="help-outline" size={ 18 } />{ ' ' }
			{ label || translate( 'Get help setting up Jetpack' ) }
		</LoggedOutFormLinkItem>
	);
}

JetpackConnectHelpButton.propTypes = {
	label: PropTypes.string,
	url: PropTypes.string,
};
