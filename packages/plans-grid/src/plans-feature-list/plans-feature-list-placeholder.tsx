/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import '../types-patch';

/**
 * Style dependencies
 */
import './style.scss';

export interface Props {
	isOpen?: boolean;
	multiColumn?: boolean;
}

const PlansFeatureListPlaceholder: React.FunctionComponent< Props > = ( {
	isOpen = false,
	multiColumn = false,
} ) => {
	const features = Array.from( Array( 10 ).keys() );

	return (
		<div className="plans-feature-list" hidden={ ! isOpen }>
			<ul
				className={ classnames( 'plans-feature-list__item-group', {
					'plans-feature-list__item-group--columns': multiColumn,
				} ) }
			>
				{ features.map( ( feature ) => (
					<li key={ feature } className="plans-feature-list__item">
						<span className="plans-feature-list__placeholder">{ '' }</span>
					</li>
				) ) }
			</ul>
		</div>
	);
};

export default PlansFeatureListPlaceholder;
