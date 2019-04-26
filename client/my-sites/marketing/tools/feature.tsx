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
	disclaimer?: string;
	title: string;
}

const MarketingToolFeature: FunctionComponent< MarketingToolFeatureProps > = ( {
	children,
	description,
	disclaimer,
	title,
} ) => {
	return (
		<Card className="tools__feature-list-item">
			<div className="tools__feature-list-item-body">
				<CardHeading>{ title }</CardHeading>
				<p>{ description }</p>
				{ disclaimer && <p className="tools__feature-list-item-disclaimer">{ disclaimer }</p> }
			</div>
			<div className="tools__feature-list-item-child-row">{ children }</div>
		</Card>
	);
};

export default MarketingToolFeature;
