import { Gridicon } from '@automattic/components';
import { Tooltip } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	className?: string;
	isPremiumThemeAvailable?: boolean;
}

const PremiumBadge: FunctionComponent< Props > = ( { className, isPremiumThemeAvailable } ) => {
	const { __ } = useI18n();

	return (
		<Tooltip
			position="top center"
			// @ts-expect-error: @types/wordpress__components doesn't align with latest @wordpress/components
			delay={ 300 }
			text={
				isPremiumThemeAvailable
					? __(
							'Let your site stand out from the crowd with a modern and stylish Premium theme. Premium themes are included in your plan.',
							__i18n_text_domain__
					  )
					: __(
							'Let your site stand out from the crowd with a modern and stylish Premium theme.',
							__i18n_text_domain__
					  )
			}
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
