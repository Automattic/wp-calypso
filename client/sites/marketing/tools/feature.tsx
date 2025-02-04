import { Card } from '@automattic/components';
import { ReactNode, FunctionComponent } from 'react';
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
				<div className="tools__feature-list-item-header">
					{ imagePath && (
						<img
							alt={ imageAlt }
							className="tools__feature-list-item-body-image"
							src={ imagePath }
							height={ 32 }
							width={ 32 }
						/>
					) }
					<CardHeading>{ title }</CardHeading>
				</div>

				<div className="tools__feature-list-item-body-text">
					<p>{ description }</p>

					{ disclaimer && <p className="tools__feature-list-item-disclaimer">{ disclaimer }</p> }
				</div>
			</div>

			<div className="tools__feature-list-item-child-row">{ children }</div>
		</Card>
	);
};

export default MarketingToolsFeature;
