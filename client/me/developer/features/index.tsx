import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useFeaturesList } from './use-features-list';
import { useRecordTracksEventWithUserIsDevAccount } from './use-record-tracks-event-with-user-is-dev-account';

import './style.scss';

export const DeveloperFeatures = () => {
	const translate = useTranslate();
	const features = useFeaturesList();
	const recordTracksEventWithUserIsDevAccount = useRecordTracksEventWithUserIsDevAccount();

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
									onClick={ () =>
										recordTracksEventWithUserIsDevAccount( 'calypso_me_developer_learn_more', {
											feature: id,
										} )
									}
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
