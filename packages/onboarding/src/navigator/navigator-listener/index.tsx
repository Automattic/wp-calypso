import { __experimentalUseNavigator as useNavigator } from '@wordpress/components';
import { useEffect } from 'react';

interface Props {
	onNavigatorPathChange: ( path?: string ) => void;
}

const NavigatorListener = ( { onNavigatorPathChange }: Props ) => {
	const { location } = useNavigator();

	useEffect( () => {
		onNavigatorPathChange( location.path );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ location ] );

	return null;
};

export default NavigatorListener;
