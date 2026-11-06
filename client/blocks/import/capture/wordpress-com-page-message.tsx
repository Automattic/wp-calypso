import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenter } from '@automattic/data-stores';
import { Button, ExternalLink } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getValidationMessage } from './url-validation-message-helper';

const HELP_CENTER_STORE = HelpCenter.register();

// Stepper only loads the Help Center for signed-in people. This address asks everyone else to log
// in first, then opens the Help Center on the Odie chat.
const ODIE_CHAT_URL = '/sites?help-center=wapuu';

export default function WordPressComPageMessage() {
	const translate = useTranslate();
	const isLoggedIn = !! useSelector( getCurrentUser );
	const { setNavigateToOdie } = useDispatch( HELP_CENTER_STORE );

	const recordClick = () => {
		recordTracksEvent( 'calypso_importer_capture_contact_support_click', {
			is_logged_in: isLoggedIn,
		} );
	};

	return createInterpolateElement( getValidationMessage( 'wordpress_com_page', translate ), {
		supportLink: isLoggedIn ? (
			<Button
				__next40pxDefaultSize
				variant="link"
				onClick={ () => {
					recordClick();
					setNavigateToOdie();
				} }
			/>
		) : (
			<ExternalLink children={ null } href={ ODIE_CHAT_URL } onClick={ recordClick } />
		),
	} );
}
