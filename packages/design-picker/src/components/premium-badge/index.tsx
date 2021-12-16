import { Gridicon } from '@automattic/components';
import { Tooltip } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	className?: string;
}

const PremiumBadge: FunctionComponent< Props > = ( { className } ) => {
	const { __ } = useI18n();

	return (
		<Tooltip
			position="top center"
			delay={ 300 }
			text={ __(
				'Premium themes are built by professional designers with quality, functionality, and ease of use in mind.',
				__i18n_text_domain__
			) }
		>
			<div className={ classNames( 'premium-badge', className ) }>
				{ /*  eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
				<Gridicon className="premium-badge__logo" icon="star" size={ 14 } />
				<span>{ __( 'Premium' ) }</span>
			</div>
		</Tooltip>
	);
};

export default PremiumBadge;
