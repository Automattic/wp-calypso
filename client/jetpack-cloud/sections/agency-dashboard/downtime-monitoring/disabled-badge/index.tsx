import { Badge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import Tooltip from 'calypso/components/tooltip';

import './style.scss';

export default function DisabledBadge() {
	const translate = useTranslate();

	const [ showPopover, setShowPopover ] = useState( false );

	const wrapperRef = useRef< HTMLDivElement | null >( null );

	return (
		<span
			className="disabled-badge-wrapper"
			onMouseEnter={ () => setShowPopover( true ) }
			onMouseLeave={ () => setShowPopover( false ) }
			onMouseDown={ () => setShowPopover( false ) }
			role="button"
			tabIndex={ 0 }
			ref={ wrapperRef }
		>
			<Badge className="disabled-badge" type="success">
				{ translate( 'Disabled' ) }
			</Badge>

			<Tooltip
				context={ wrapperRef.current }
				isVisible={ showPopover }
				position="bottom"
				className="disabled-badge__tooltip"
			>
				{ translate( 'One of the selected sites does not have a Basic plan.' ) }
			</Tooltip>
		</span>
	);
}
