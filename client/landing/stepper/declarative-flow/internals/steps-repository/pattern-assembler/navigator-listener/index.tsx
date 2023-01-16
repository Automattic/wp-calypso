import { __experimentalUseNavigator as useNavigator } from '@wordpress/components';
import { useEffect } from 'react';

interface Props {
	onLocationChange: ( location: string ) => void;
}

const NavigatorListener = ( { onLocationChange }: Props ) => {
	const navigator = useNavigator();

	useEffect( () => {
		onLocationChange( navigator.location );
	}, [ navigator.location ] );

	return null;
};

export default NavigatorListener;
