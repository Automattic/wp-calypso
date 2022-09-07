import classNames from 'classnames';
import { FunctionComponent, useRef } from 'react';
// eslint-disable-next-line no-restricted-imports
import wooCommerceImage from 'calypso/assets/images/onboarding/woo-commerce.svg';

import './style.scss';

interface Props {
	className?: string;
}

const WooCommerceBundledBadge: FunctionComponent< Props > = ( { className } ) => {
	const divRef = useRef( null );
	return (
		<div className={ classNames( 'woocommerce-bundled-badge', className ) } ref={ divRef }>
			<img src={ wooCommerceImage } alt="" />
			<span>WooCommerce</span>
		</div>
	);
};

export default WooCommerceBundledBadge;
