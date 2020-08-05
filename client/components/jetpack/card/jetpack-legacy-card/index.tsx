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
} from 'components/jetpack/card/jetpack-product-card';

/**
 * Style dependencies
 */
import './style.scss';

type Props = JetpackProductCardProps;

const JetpackLegacyCard: FunctionComponent< Props > = ( props ) => {
	return (
		<JetpackProductCard
			{ ...props }
			className={ classNames( props.className, 'jetpack-legacy-card' ) }
		/>
	);
};

export default JetpackLegacyCard;
