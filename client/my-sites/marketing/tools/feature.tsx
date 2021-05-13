/**
 * External dependencies
 */
import React, { ReactNode, FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import CardHeading from 'calypso/components/card-heading';

interface Props {
	children: ReactNode;
	description: ReactNode;
	disclaimer?: ReactNode;
	imageAlt?: string;
	imagePath?: string;
	title: ReactNode;
}

const MarketingToolsFeature: FunctionComponent< Props > = ( {
	children,
	description,
	disclaimer,
	imageAlt,
	imagePath,
	title,
} ) => {
	return (
		<Card className="tools__feature-list-item">
			<div className="tools__feature-list-item-body">
				{ imagePath && (
					<img alt={ imageAlt } className="tools__feature-list-item-body-image" src={ imagePath } />
				) }

				<div className="tools__feature-list-item-body-text">
					<CardHeading>{ title }</CardHeading>

					<p>{ description }</p>

					{ disclaimer && <p className="tools__feature-list-item-disclaimer">{ disclaimer }</p> }
				</div>
			</div>

			<div className="tools__feature-list-item-child-row">{ children }</div>
		</Card>
	);
};

export default MarketingToolsFeature;
