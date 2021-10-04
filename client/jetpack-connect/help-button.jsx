import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import LoggedOutFormLinkItem from 'calypso/components/logged-out-form/link-item';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function JetpackConnectHelpButton( { label, url } ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const recordClick = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_jpc_help_link_click' ) );
	}, [ dispatch ] );

	return (
		<LoggedOutFormLinkItem
			className="jetpack-connect__help-button"
			href={ url || 'https://jetpack.com/contact-support?hpi=1' }
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
