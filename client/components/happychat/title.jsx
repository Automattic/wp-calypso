import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './title.scss';

/*
 * React component for rendering title bar
 */
export default function Title( { onCloseChat } ) {
	const translate = useTranslate();

	return (
		<div className="happychat__title">
			<div className="happychat__active-toolbar">
				<h4>{ translate( 'Support Chat' ) }</h4>
				<div onClick={ onCloseChat }>
					<Gridicon icon="cross" />
				</div>
			</div>
		</div>
	);
}
