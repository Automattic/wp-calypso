import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useHandleClickLink } from './use-handle-click-link';

import './style.scss';

export const WordPressAgentCard = () => {
	const translate = useTranslate();
	const handleClickLink = useHandleClickLink();

	return (
		<Card className="developer-features-list__item">
			<div className="developer-features-list__item-tag">{ translate( 'New' ) }</div>
			<div className="developer-features-list__item-title">{ translate( 'WordPress Agent' ) }</div>
			<div className="developer-features-list__item-description">
				{ translate(
					'Manage your site, create content, and monitor performance with WordPress Agent. Connect through Telegram, email, or Slack.'
				) }
			</div>
			<div className="developer-features-list__item-learn-more">
				<a id="wordpress-agent" href="/me/agent" onClick={ handleClickLink }>
					{ translate( 'Manage connections' ) }
				</a>
			</div>
		</Card>
	);
};
