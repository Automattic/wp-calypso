import { Card } from '@automattic/components';
import { useOpenArticleInHelpCenter } from '@automattic/help-center/src/hooks';
import { useTranslate } from 'i18n-calypso';
import { GitHubDeploymentCard } from './github-deployment-card';
import { StudioCard } from './studio-card';
import { useFeaturesList } from './use-features-list';
import { useHandleClickLink } from './use-handle-click-link';

import './style.scss';

export const DeveloperFeatures = () => {
	const translate = useTranslate();
	const features = useFeaturesList();
	const handleClickLinkTracks = useHandleClickLink();
	const { openArticleInHelpCenter } = useOpenArticleInHelpCenter();

	const handleFeatureClickLink = ( event: React.MouseEvent< HTMLAnchorElement > ) => {
		handleClickLinkTracks( event );
		const featureArticleLink = event?.currentTarget?.href;
		const featureItemId = event?.currentTarget?.id;
		// Opens the following feature articles in Help Center:
		// "Custom code" and "Free SSL certificate"
		const featureArticlesToOpenInHelpCenter = [ 'code', 'https-ssl' ];

		if (
			openArticleInHelpCenter &&
			featureArticleLink &&
			featureArticlesToOpenInHelpCenter.includes( featureItemId )
		) {
			event.preventDefault();
			openArticleInHelpCenter( featureArticleLink );
		}
	};

	return (
		<>
			<div className="developer-features-list developer-features-list--latest">
				<StudioCard />
				<GitHubDeploymentCard />
			</div>

			<h2 className="developer-features-sub-title">{ translate( 'Popular features' ) }</h2>
			<div className="developer-features-list">
				{ features.map( ( { id, title, description, linkLearnMore } ) => (
					<Card className="developer-features-list__item" key={ id }>
						<div className="developer-features-list__item-title">{ title }</div>
						<div className="developer-features-list__item-description">{ description }</div>
						{ linkLearnMore && (
							<div className="developer-features-list__item-learn-more">
								<a
									id={ id }
									href={ linkLearnMore }
									target="_blank"
									rel="noopener noreferrer"
									onClick={ handleFeatureClickLink }
								>
									{ translate( 'Learn more' ) }
								</a>
							</div>
						) }
					</Card>
				) ) }
			</div>
		</>
	);
};
