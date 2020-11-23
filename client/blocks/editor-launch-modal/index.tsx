/**
 * External dependencies
 */
import React from 'react';
import FocusedLaunchModal from '@automattic/launch';
import noop from 'lodash/noop';
import { connect } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';

interface Props {
	siteId: number;
	locale: string;
}

const EditorLaunchModal: React.FunctionComponent< Props > = ( { siteId, locale } ) => {
	return (
		<FocusedLaunchModal
			onClose={ noop }
			siteId={ siteId }
			locale={ locale }
			openCheckout={ noop }
		/>
	);
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state ) as number;
	const locale = getCurrentUserLocale( state );
	return {
		siteId,
		locale,
	};
} )( EditorLaunchModal );
