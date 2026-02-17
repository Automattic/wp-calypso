import { __experimentalHStack as HStack } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import AppTitle from '../app-title';
import './index.scss';

export const MobileHeader = () => {
	const isTabletOrDesktop = useViewportMatch( 'small', '>=' );

	if ( isTabletOrDesktop ) {
		return null;
	}

	return (
		<HStack className="mobile-header" spacing={ 0 } justify="space-between">
			<AppTitle className="mobile-header__app-title" />
		</HStack>
	);
};

export default MobileHeader;
