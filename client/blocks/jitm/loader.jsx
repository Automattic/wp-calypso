/*
 * JITMLoader -
 *    - Renders <JITM>, but computes messagePath
 *    - Uses redux to find the current sectionName and build a messagePath for JITM.
 * Usage:
 *    <JITMLoader messagePathSuffix="sidebar_notice" />
 *    If you are on section "pages", it will render <JITM messagePath="calypso:pages:sidebar_notice" />.
 *
 *    All other props are passed through directly, for example, you can also pass-through prop "template" to JITM.
 *    <JITMLoader messagePathSuffix="sidebar_notice" template="sidebar-banner" />
 */

/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import JITM from 'calypso/blocks/jitm';
import { getSectionName } from 'calypso/state/ui/selectors';

export const JITMLoader = ( { messagePathSuffix, ...restProps } ) => <JITM { ...restProps } />;
const mapStateToProps = ( state, ownProps ) => ( {
	messagePath: `calypso:${ getSectionName( state ) }:${ ownProps.messagePathSuffix }`,
} );
const mapDispatchToProps = null;
export default connect( mapStateToProps, mapDispatchToProps )( JITMLoader );
