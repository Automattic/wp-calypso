import { WordPressLogo } from '@automattic/components';
import { __experimentalHStack as HStack } from '@wordpress/components';
import './style.scss';

function Logo() {
	return (
		<HStack style={ { width: 'auto' } } alignment="left" spacing={ 2 } justify="flex-start">
			<div>
				<WordPressLogo size={ 24 } />
			</div>
			<span className="dashboard-logo__text">WordPress.com</span>
		</HStack>
	);
}

export default Logo;
