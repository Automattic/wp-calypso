import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import InlineHelpForumView from 'calypso/blocks/inline-help/inline-help-forum-view';
import QuerySupportTypes from 'calypso/blocks/inline-help/inline-help-query-support-types';
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
	const { __ } = useI18n();
	const headerEl = useRef();
	const supportVariationDetermined = useSelector( isSupportVariationDetermined );

	// focus the header on mount
	useEffect( () => {
		headerEl.current.focus();
	}, [] );

	return (
		<section className="inline-help__secondary-view inline-help__contact">
		<QuerySupportTypes />
			<h2 ref={ headerEl } className="inline-help__title" tabIndex="-1">
				{ __( 'Get Support' ) }
			</h2>
			{ supportVariationDetermined ? <InlineHelpContactViewLoaded /> : <PlaceholderLines /> }
		</section>
	);
}
