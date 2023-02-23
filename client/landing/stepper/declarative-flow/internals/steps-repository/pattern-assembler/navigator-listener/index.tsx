import { __experimentalUseNavigator as useNavigator } from '@wordpress/components';
import { useEffect } from 'react';
import type { NavigatorLocation } from '../types';

interface Props {
	onLocationChange: ( location: NavigatorLocation ) => void;
}

const NavigatorListener = ( { onLocationChange }: Props ) => {
	const navigator = useNavigator();

	useEffect( () => {
		onLocationChange( navigator.location );
	}, [ navigator.location ] );

	return null;
};

export default NavigatorListener;
