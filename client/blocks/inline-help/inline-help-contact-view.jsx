import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InlineHelpForumView from 'calypso/blocks/inline-help/inline-help-forum-view';
import PlaceholderLines from 'calypso/blocks/inline-help/placeholder-lines';
import HelpContact from 'calypso/me/help/help-contact';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getInlineHelpSupportVariation, {
	SUPPORT_FORUM,
} from 'calypso/state/selectors/get-inline-help-support-variation';
import isSupportVariationDetermined from 'calypso/state/selectors/is-support-variation-determined';

function InlineHelpContactViewLoaded() {
	const dispatch = useDispatch();
	const supportVariation = useSelector( getInlineHelpSupportVariation );

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_inlinehelp_contact_view', {
				support_variation: supportVariation,
			} )
		);
	}, [ dispatch, supportVariation ] );

	return supportVariation === SUPPORT_FORUM ? <InlineHelpForumView /> : <HelpContact compact />;
}

export default function InlineHelpContactView() {
	const supportVariationDetermined = useSelector( isSupportVariationDetermined );

	if ( ! supportVariationDetermined ) {
		return <PlaceholderLines />;
	}

	return <InlineHelpContactViewLoaded />;
}
