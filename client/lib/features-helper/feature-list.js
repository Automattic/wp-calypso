/**
 * External dependencies
 */
import React from 'react';
/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { Card } from '@automattic/components';
//import Item from './item';

export const FeatureList = React.memo( () => {
	const flagsToCheck = [ 'anchor-fm' ];
	return (
		<>
			<div>Features</div>
			<Card className="features-helper__current-features">
				{ flagsToCheck
					.filter( ( flag ) => config.isEnabled( flag ) )
					.map( ( flag ) => (
						<div
							className="features-helper__feature-header"
							key={ flag }
							tooltip={ `Development flag ${ flag } enabled` }
						>
							{ flag }
						</div>
					) ) }
			</Card>
		</>
	);
} );
export default FeatureList;
