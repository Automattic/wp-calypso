import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loadTrackingTool } from 'calypso/state/analytics/actions';

export default ( trackingTool ) =>
	createHigherOrderComponent(
		( EnhancedComponent ) => ( props ) => {
			const dispatch = useDispatch();
			useEffect( () => {
				dispatch( loadTrackingTool( trackingTool ) );
			}, [ dispatch ] );

			return <EnhancedComponent { ...props } />;
		},
		'WithTrackingTool'
	);
