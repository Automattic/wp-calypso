/**
 * External dependencies
 */
import React from 'react';

import './index.stories.scss';
import ProductIcon from '.';
import { supportedSlugs } from './config';

export default { title: 'ProductIcon' };

export const Default = () => {
	return (
		<>
			{ supportedSlugs.map( ( slug ) => (
				<div className="index.stories__icon-tile">
					<ProductIcon slug={ slug } className="index.stories__icon-image" />
					<pre className="index.stories__icon-slug">{ slug }</pre>
				</div>
			) ) }
		</>
	);
};
