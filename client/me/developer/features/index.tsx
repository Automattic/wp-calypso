import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import { handleClickLink } from './handle-click-link';
import { useFeaturesList } from './use-features-list';

import './style.scss';

export const DeveloperFeatures = () => {
	const translate = useTranslate();
	const features = useFeaturesList();
	const dispatch = useDispatch();

	return (
		<>
			<div className="developer-features-list">
				{ features.map( ( { id, title, description, linkLearnMore } ) => (
					<Card className="developer-features-list__item" key={ id }>
						<div className="developer-features-list__item-title">{ title }</div>
						<div className="developer-features-list__item-description">{ description }</div>
						{ linkLearnMore && (
							<div className="developer-features-list__item-learn-more">
								<a
									href={ linkLearnMore }
									target="_blank"
									rel="noopener noreferrer"
									onClick={ ( event ) => handleClickLink( dispatch, event ) }
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
