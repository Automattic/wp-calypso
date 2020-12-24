/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Card from '.';
import type { TagName, Props } from '.';

const CompactCard = < T extends TagName >( props: Props< T > ): JSX.Element => (
	<Card { ...props } compact />
);

export default React.memo( CompactCard ) as typeof CompactCard;
