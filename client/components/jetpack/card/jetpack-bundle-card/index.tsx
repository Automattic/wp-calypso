/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import JetpackProductCard, {
	Props as JetpackProductCardProps,
} from 'calypso/components/jetpack/card/jetpack-product-card';

/**
 * Style dependencies
 */
import './style.scss';

type Props = JetpackProductCardProps;

const JetpackBundleCard: FunctionComponent< Props > = ( props ) => {
	return (
		<JetpackProductCard
			{ ...props }
			className={ classNames( props.className, 'jetpack-bundle-card' ) }
		/>
	);
};

export default JetpackBundleCard;
