import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useHandleClickLink } from './use-handle-click-link';

import './style.scss';

export const StudioCard = () => {
	const translate = useTranslate();
	const handleClickLink = useHandleClickLink();

	return (
		<Card className="developer-features-list__item">
			<div className="developer-features-list__item-tag">{ translate( 'New' ) }</div>
			<div className="developer-features-list__item-title">
				{ translate( 'Studio by WordPress.com' ) }
			</div>
			<div className="developer-features-list__item-description">
				{ translate(
					'A fast, free way to develop locally with WordPress. Share your local sites with clients or colleagues and keep your local development process smooth and simple.'
				) }
			</div>
			<div className="developer-features-list__item-learn-more">
				<a
					id="studio"
					href={ localizeUrl( 'https://developer.wordpress.com/studio/' ) }
					target="_blank"
					rel="noopener noreferrer"
					onClick={ handleClickLink }
				>
					{ translate( 'Learn more' ) }
				</a>
			</div>
		</Card>
	);
};
