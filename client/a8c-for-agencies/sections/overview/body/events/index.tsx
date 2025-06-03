import { useTranslate } from 'i18n-calypso';
import Offering from 'calypso/a8c-for-agencies/components/offering';

import './styles.scss';

const OverviewBodyEvents = () => {
	const translate = useTranslate();

	return (
		<Offering
			title={ translate( 'Upcoming events' ) }
			description={ translate(
				'Grow your business and level up by joining exclusive Automattic for Agencies events.'
			) }
		>
			<div className="a4a-event">
				<div className="a4a-event__image"></div>
				<div className="a4a-event__content">
					<div className="a4a-event__header">
						<div className="a4a-event__date"></div>
						<div className="a4a-event__title">
							<h3>WordPress.com</h3>
						</div>
					</div>
					<div className="a4a-event__description">
						<p>
							Grow your business and level up by joining exclusive Automattic for Agencies events.
						</p>
					</div>
				</div>
			</div>
		</Offering>
	);
};

export default OverviewBodyEvents;
