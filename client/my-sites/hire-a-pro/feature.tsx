/**
 * External dependencies
 */
import React, { ReactNode, FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';

interface Props {
	children: ReactNode;
	description: string;
	disclaimer?: string;
	imageAlt?: string;
	imagePath?: string;
	title: string;
}

const MarketingFeature: FunctionComponent< Props > = ( {
	children,
	description,
	disclaimer,
	imageAlt,
	imagePath,
	title,
} ) => {
	return (
		<Card className="hire-a-pro__feature-list-item">
			<div className="hire-a-pro__feature-list-item-body">
				{ imagePath && (
					<img
						alt={ imageAlt }
						className="hire-a-pro__feature-list-item-body-image"
						src={ imagePath }
					/>
				) }

				<div className="hire-a-pro__feature-list-item-body-text">
					<CardHeading>{ title }</CardHeading>

					<p>{ description }</p>

					{ disclaimer && (
						<p className="hire-a-pro__feature-list-item-disclaimer">{ disclaimer }</p>
					) }
				</div>
			</div>

			<div className="hire-a-pro__feature-list-item-child-row">{ children }</div>
		</Card>
	);
};

export default MarketingFeature;
