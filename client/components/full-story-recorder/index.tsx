/**
 * External dependencies
 */
import { useEffect, FunctionComponent } from 'react';
import { shutdown, restart } from '@fullstory/browser';

const FullStoryRecorder: FunctionComponent = () => {
	useEffect( () => {
		restart();
		return () => {
			shutdown();
		};
	} );
	return null;
};

export default FullStoryRecorder;
