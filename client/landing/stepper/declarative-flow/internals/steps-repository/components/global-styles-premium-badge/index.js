import { isEnabled } from '@automattic/calypso-config';
import { Tooltip } from '@wordpress/components';
import { Icon, starFilled } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import Badge from 'calypso/components/badge';

import './style.scss';

const GlobalStylesPremiumBadge = () => {
	const { __ } = useI18n();

	if ( ! isEnabled( 'limit-global-styles' ) ) {
		return null;
	}

	return (
		<Tooltip
			text={ __(
				'Upgrade to a paid plan for color changes to take affect and to unlock all premium design tools'
			) }
		>
			<span className="global-styles-premium-badge">
				<Badge type="info">
					<Icon icon={ starFilled } size={ 18 } />
					<span>{ __( 'Premium' ) }</span>
				</Badge>
			</span>
		</Tooltip>
	);
};

export default GlobalStylesPremiumBadge;
