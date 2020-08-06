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

type Props = JetpackProductCardProps & {
	deprecated?: boolean;
};

const JetpackPlanCard: FunctionComponent< Props > = ( props ) => {
	return (
		<JetpackProductCard
			{ ...props }
			className={ classNames( props.className, 'jetpack-plan-card', {
				'is-deprecated': props.deprecated,
			} ) }
		/>
	);
};

export default JetpackPlanCard;
