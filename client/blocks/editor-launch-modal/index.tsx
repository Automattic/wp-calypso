/**
 * External dependencies
 */
import React from 'react';
import FocusedLaunchModal from '@automattic/launch';
import noop from 'lodash/noop';
import { connect } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

interface Props {
	siteId: number;
}

const EditorLaunchModal: React.FunctionComponent< Props > = ( { siteId } ) => {
	return <FocusedLaunchModal onClose={ noop } siteId={ siteId } />;
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state ) as number;
	return {
		siteId,
	};
} )( EditorLaunchModal );
