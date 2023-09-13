import { Badge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import UpgradePopover from '../upgrade-popover';

import './style.scss';

export default function UpgradeBadge() {
	const translate = useTranslate();

	const [ showPopover, setShowPopover ] = useState( false );

	const wrapperRef = useRef< HTMLDivElement | null >( null );

	return (
		<span
			className="upgrade-badge__wrapper"
			onMouseEnter={ () => setShowPopover( true ) }
			onMouseLeave={ () => setShowPopover( false ) }
			role="button"
			tabIndex={ 0 }
			ref={ wrapperRef }
		>
			<Badge className="upgrade-badge" type="success">
				{ translate( 'Upgrade' ) }
			</Badge>

			<UpgradePopover context={ wrapperRef.current } isVisible={ showPopover } position="bottom" />
		</span>
	);
}
