import { Popover, Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

type Props = {
	context: HTMLElement | null;
	isVisible: boolean;
	position?: string;
};

export default function UpgradePopover( { context, isVisible, position }: Props ) {
	const translate = useTranslate();

	const onClick = () => {
		// TODO: Add event tracking and show/hide modal
	};

	return (
		<Popover
			className="upgrade-popover"
			context={ context }
			isVisible={ isVisible }
			position={ position }
		>
			<h2 className="upgrade-popover__heading">{ translate( 'Maximise uptime' ) }</h2>

			<ul className="upgrade-popover__list">
				<li>{ translate( '1 minute monitoring interval' ) }</li>
				<li>{ translate( 'SMS Notifications' ) }</li>
				<li>{ translate( 'Multiple email recipients' ) }</li>
			</ul>

			<Button className="upgrade-popover__button" primary onClick={ onClick }>
				{ translate( 'Explore' ) }
			</Button>
		</Popover>
	);
}
