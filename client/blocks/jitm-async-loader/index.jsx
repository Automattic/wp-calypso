/*
 * JITMAsyncLoader -
 *    - Uses <AsyncLoad> to load <JITM>
 *    - Uses redux to find the current sectionName and build a messagePath for JITM.
 * Usage:
 *    <JITMAsyncLoader messagePathSuffix="sidebar_notice" />
 *    If you are on section "pages", it will render <JITM messagePath="calypso:pages:sidebar_notice" />,
 *    loaded async.
 *    You can also pass-through prop "messagePath" to JITM.
 */

/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import { getSectionName } from 'calypso/state/ui/selectors';

export const JITMAsyncLoader = ( { messagePath, template } ) => (
	<AsyncLoad
		require="calypso/blocks/jitm"
		messagePath={ messagePath }
		template={ template }
		placeholder={ null }
	/>
);
const mapStateToProps = ( state, ownProps ) => ( {
	messagePath: `calypso:${ getSectionName( state ) }:${ ownProps.messagePathSuffix }`,
} );
const mapDispatchToProps = null;
export default connect( mapStateToProps, mapDispatchToProps )( JITMAsyncLoader );
