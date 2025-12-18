import { __experimentalHStack as HStack } from '@wordpress/components';
import AppTitle from '../app-title';
import './index.scss';

export const MobileHeader = () => {
	return (
		<HStack className="mobile-header" spacing={ 0 } justify="space-between">
			<AppTitle />
		</HStack>
	);
};
