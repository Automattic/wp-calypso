/**
 * Internal dependencies
 */
import { getSectionName } from 'calypso/state/ui/selectors';

/**
 * External Dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';

/**
 * HOC designed to build a JITM `messagePath` based on the current
 * `sectionName` + a suffix. This is the default used across Calypso
 * and so it is codified here.
 * eg: `calypso:pages:sidebar_notice`
 *
 * @param WrappedComponent function the component to be wrapped
 */

const withSectionMessagePath = ( WrappedComponent ) => ( props ) => {
	const sectionName = useSelector( ( state ) => getSectionName( state ) );
	const messagePath = `calypso:${ sectionName }:${ props.messagePathSuffix }`;
	return <WrappedComponent messagePath={ messagePath } { ...props } />;
};

export default withSectionMessagePath;
