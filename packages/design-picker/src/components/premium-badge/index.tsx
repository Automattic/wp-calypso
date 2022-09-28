import { Gridicon, Popover } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { FunctionComponent, useRef, useState } from 'react';

import './style.scss';

interface Props {
	className?: string;
	tooltipPosition?: string;
	isPremiumThemeAvailable?: boolean;
}

const PremiumBadge: FunctionComponent< Props > = ( {
	className,
	tooltipPosition = 'bottom left',
	isPremiumThemeAvailable,
} ) => {
	const { __ } = useI18n();

	const tooltipText = isPremiumThemeAvailable
		? __(
				'Let your site stand out from the crowd with a modern and stylish Premium theme. Premium themes are included in your plan.',
				__i18n_text_domain__
		  )
		: __(
				'Let your site stand out from the crowd with a modern and stylish Premium theme.',
				__i18n_text_domain__
		  );

	const divRef = useRef( null );
	const [ isPopoverVisible, setIsPopoverVisible ] = useState( false );
	return (
		<div
			className={ classNames( 'premium-badge', className ) }
			ref={ divRef }
			onMouseEnter={ () => setIsPopoverVisible( true ) }
			onMouseLeave={ () => setIsPopoverVisible( false ) }
		>
			{ /*  eslint-disable-next-line wpcalypso/jsx-gridicon-size */ }
			<Gridicon className="premium-badge__logo" icon="star" size={ 14 } />
			<span>{ __( 'Premium' ) }</span>
			<Popover
				className="premium-badge__popover"
				context={ divRef.current }
				isVisible={ isPopoverVisible }
				position={ tooltipPosition }
			>
				{ tooltipText }
			</Popover>
		</div>
	);
};

export default PremiumBadge;
