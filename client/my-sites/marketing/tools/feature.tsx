/**
 * External dependencies
 */
import React, { ReactNode, FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';

interface MarketingToolFeatureProps {
	children: ReactNode;
	description: string;
	title: string;
}

const MarketingToolFeature: FunctionComponent< MarketingToolFeatureProps > = ( {
	children,
	description,
	title,
}: MarketingToolFeatureProps ) => {
	return (
		<Card>
			<CardHeading>{ title }</CardHeading>
			<p>{ description }</p>
			{ children }
		</Card>
	);
};

export default MarketingToolFeature;
