import { Button } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { openHelpCenterChat } from '../../utils/open-help-center-chat';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import './style.scss';

interface Props {
	/** The conversation summary the support chat opens with. */
	message?: string;
	/** Set once the user has replied past it, or it was restored from history. */
	isMessageStale?: boolean;
	/** On an interactive UI surface: while the agent replies, or once the surface is stale. */
	disabled?: boolean;
}

/**
 * The button the support hand-off shows, as the `AgentsManagerOpenHelpCenterButton` surface
 * component or the `open-help-center` ability's row: one click opens the support chat.
 */
export default function OpenHelpCenterButton( { message, isMessageStale, disabled }: Props ) {
	useEffect( () => {
		if ( ! isMessageStale ) {
			recordBigSkyTracksEvent( 'jetpack_big_sky_open_help_center_button_shown' );
		}
	}, [ isMessageStale ] );

	return (
		<Button
			className="agents-manager-open-help-center-button"
			variant="primary"
			disabled={ disabled }
			accessibleWhenDisabled
			onClick={ () => {
				recordBigSkyTracksEvent( 'jetpack_big_sky_open_help_center_button_click' );
				openHelpCenterChat( message );
			} }
		>
			{ __( 'Get help', __i18n_text_domain__ ) }
		</Button>
	);
}
