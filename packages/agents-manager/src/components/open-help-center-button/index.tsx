import { Button } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { openHelpCenterChat } from '../../utils/open-help-center-chat';
import { recordBigSkyTracksEvent } from '../../utils/tracks';

interface Props {
	/** The conversation summary the support chat opens with. */
	message?: string;
	/** Set by the chat once the user has replied past this row. */
	isMessageStale?: boolean;
}

/** The button the `open-help-center` ability shows: one click opens the support chat. */
export default function OpenHelpCenterButton( { message, isMessageStale }: Props ) {
	useEffect( () => {
		if ( ! isMessageStale ) {
			recordBigSkyTracksEvent( 'jetpack_big_sky_open_help_center_button_shown' );
		}
	}, [ isMessageStale ] );

	return (
		<Button
			variant="primary"
			onClick={ () => {
				recordBigSkyTracksEvent( 'jetpack_big_sky_open_help_center_button_click' );
				openHelpCenterChat( message );
			} }
		>
			{ __( 'Get help', __i18n_text_domain__ ) }
		</Button>
	);
}
