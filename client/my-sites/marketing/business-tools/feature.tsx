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
	category: ReactNode;
}

const MarketingBusinessToolsFeature: FunctionComponent< Props > = ( {
	children,
	description,
	disclaimer,
	imageAlt,
	imagePath,
	title,
	category,
} ) => {
	return (
		<Card className="business-tools__feature-list-item">
			<div className="business-tools__feature-list-item-body">
				{ imagePath && (
					<img
						alt={ imageAlt }
						className="business-tools__feature-list-item-body-image"
						src={ imagePath }
					/>
				) }

				<div className="business-tools__feature-list-item-body-text">
					<p className="business-tools__feature-category">{ category }</p>
					<CardHeading>{ title }</CardHeading>

					<p>{ description }</p>

					{ disclaimer && (
						<p className="business-tools__feature-list-item-disclaimer">{ disclaimer }</p>
					) }
				</div>
			</div>

			<div className="business-tools__feature-list-item-child-row">{ children }</div>
		</Card>
	);
};

export default MarketingBusinessToolsFeature;
