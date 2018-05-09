/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import HelpContact from 'me/help/help-contact';
import InlineHelpForumView from 'blocks/inline-help/inline-help-forum-view';
import PlaceholderLines from 'blocks/inline-help/placeholder-lines';
import getInlineHelpSupportVariation, {
	SUPPORT_FORUM,
} from 'state/selectors/get-inline-help-support-variation';
import { getHelpSelectedSite } from 'state/help/selectors';
import { isSupportVariationDetermined } from 'state/selectors';

const InlineHelpContactView = ( {
	/* eslint-disable no-unused-vars, no-shadow */
	isSupportVariationDetermined = false,
	/* eslint-enable no-unused-vars, no-shadow */
	supportVariation,
	selectedSite,
} ) => {
	if ( ! isSupportVariationDetermined ) {
		return <PlaceholderLines />;
	}

	if ( supportVariation === SUPPORT_FORUM ) {
		return <InlineHelpForumView />;
	}

	return <HelpContact compact selectedSite={ selectedSite } />;
};

export default connect( state => ( {
	supportVariation: getInlineHelpSupportVariation( state ),
	isSupportVariationDetermined: isSupportVariationDetermined( state ),
	selectedSite: getHelpSelectedSite( state ),
} ) )( InlineHelpContactView );
