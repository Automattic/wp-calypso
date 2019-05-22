/**
 * External dependencies
 */
import React, { ReactNode, FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CardHeading from 'components/card-heading';

/**
 * Style dependencies
 */
import './style.scss';

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
		<Card className="marketing-page-feature__item">
			<div className="marketing-page-feature__item-body">
				{ imagePath && (
					<img
						alt={ imageAlt }
						className="marketing-page-feature__item-body-image"
						src={ imagePath }
					/>
				) }

				<div className="marketing-page-feature__item-body-text">
					<CardHeading>{ title }</CardHeading>

					<p>{ description }</p>

					{ disclaimer && (
						<p className="marketing-page-feature__item-disclaimer">{ disclaimer }</p>
					) }
				</div>
			</div>

			<div className="marketing-page-feature__item-child-row">{ children }</div>
		</Card>
	);
};

export default MarketingFeature;
