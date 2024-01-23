import { useTranslate } from 'i18n-calypso';
import { useFeaturesList } from './use-features-list';

import './style.scss';

export const DeveloperFeatures = () => {
	const translate = useTranslate();
	const features = useFeaturesList();

	return (
		<>
			<div className="developer-features-list">
				{ features.map( ( { title, description, linkLearnMore } ) => (
					<div className="developer-features-list__item">
						<div className="developer-features-list__item-title">{ title }</div>
						<div className="developer-features-list__item-description">{ description }</div>
						<div className="developer-features-list__item-learn-more">
							<a href={ linkLearnMore } target="_blank" rel="noopener noreferrer">
								{ translate( 'Learn more' ) }
							</a>
						</div>
					</div>
				) ) }
			</div>
		</>
	);
};
