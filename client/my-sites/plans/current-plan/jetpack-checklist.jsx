/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal Dependencies
 */
import Checklist from 'blocks/checklist';
import { getPluginsForSite } from 'state/plugins/premium/selectors';

const JetpackChecklist = () => <Checklist />;

export default connect( ( state, { siteId } ) => ( {
	plugins: getPluginsForSite( state, siteId, false ),
} ) )( JetpackChecklist );
