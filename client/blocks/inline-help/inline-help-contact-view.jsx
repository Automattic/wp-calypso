import { SUPPORT_FORUM } from '@automattic/help-center';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InlineHelpForumView from 'calypso/blocks/inline-help/inline-help-forum-view';
import QuerySupportTypes from 'calypso/blocks/inline-help/inline-help-query-support-types';
import PlaceholderLines from 'calypso/blocks/inline-help/placeholder-lines';
import HelpContact from 'calypso/me/help/help-contact';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getInlineHelpSupportVariation from 'calypso/state/selectors/get-inline-help-support-variation';
import isSupportVariationDetermined from 'calypso/state/selectors/is-support-variation-determined';
import { getSectionName } from 'calypso/state/ui/selectors';

function InlineHelpContactViewLoaded() {
	const dispatch = useDispatch();
	const supportVariation = useSelector( getInlineHelpSupportVariation );
	const sectionName = useSelector( getSectionName );

	useEffect( () => {
		dispatch(
			recordTracksEvent( 'calypso_inlinehelp_contact_view', {
				support_variation: supportVariation,
				location: 'inline-help-popover',
				section: sectionName,
			} )
		);
	}, [ dispatch, supportVariation, sectionName ] );

	return supportVariation === SUPPORT_FORUM ? (
		<InlineHelpForumView />
	) : (
		<HelpContact compact source="inline-help" />
	);
}

export default function InlineHelpContactView() {
	const supportVariationDetermined = useSelector( isSupportVariationDetermined );

	return (
		<>
			<QuerySupportTypes />
			{ supportVariationDetermined ? <InlineHelpContactViewLoaded /> : <PlaceholderLines /> }
		</>
	);
}
