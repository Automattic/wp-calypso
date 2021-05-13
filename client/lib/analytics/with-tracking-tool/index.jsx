/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import { loadTrackingTool } from 'calypso/state/analytics/actions';

export default ( trackingTool ) =>
	createHigherOrderComponent(
		( EnhancedComponent ) => ( props ) => {
			const dispatch = useDispatch();
			React.useEffect( () => {
				dispatch( loadTrackingTool( trackingTool ) );
			}, [ dispatch ] );

			return <EnhancedComponent { ...props } />;
		},
		'WithTrackingTool'
	);
