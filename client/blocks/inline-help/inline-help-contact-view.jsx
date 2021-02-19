/**
 * External dependencies
 */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import HelpContact from 'calypso/me/help/help-contact';
import InlineHelpForumView from 'calypso/blocks/inline-help/inline-help-forum-view';
import PlaceholderLines from 'calypso/blocks/inline-help/placeholder-lines';
import getInlineHelpSupportVariation, {
	SUPPORT_FORUM,
} from 'calypso/state/selectors/get-inline-help-support-variation';
import { getHelpSelectedSite } from 'calypso/state/help/selectors';
import isSupportVariationDetermined from 'calypso/state/selectors/is-support-variation-determined';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';

const InlineHelpContactView = ( {
	/* eslint-disable no-shadow */
	isSupportVariationDetermined = false,
	/* eslint-enable no-shadow */
	supportVariation,
	selectedSite,
} ) => {
	if ( ! isSupportVariationDetermined ) {
		return <PlaceholderLines />;
	}

	return (
		<Fragment>
			<TrackComponentView
				eventName="calypso_inlinehelp_contact_view"
				eventProperties={ {
					support_variation: supportVariation,
				} }
			/>
			{ supportVariation === SUPPORT_FORUM ? (
				<InlineHelpForumView />
			) : (
				<HelpContact compact selectedSite={ selectedSite } />
			) }
		</Fragment>
	);
};

export default connect( ( state ) => ( {
	supportVariation: getInlineHelpSupportVariation( state ),
	isSupportVariationDetermined: isSupportVariationDetermined( state ),
	selectedSite: getHelpSelectedSite( state ),
} ) )( InlineHelpContactView );
