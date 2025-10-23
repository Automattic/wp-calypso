import { Badge, Tooltip } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import { RestrictionType } from '../types';

import './style.scss';

type Props = {
	restriction: RestrictionType;
};

export default function NotAvailableBadge( { restriction }: Props ) {
	const translate = useTranslate();

	const [ showPopover, setShowPopover ] = useState( false );

	const wrapperRef = useRef< HTMLDivElement | null >( null );

	return (
		<span
			className="not-available-badge__wrapper"
			onMouseEnter={ () => setShowPopover( true ) }
			onMouseLeave={ () => setShowPopover( false ) }
			onMouseDown={ () => setShowPopover( false ) }
			role="button"
			tabIndex={ 0 }
			ref={ wrapperRef }
		>
			<Badge className="not-available-badge">{ translate( 'Not Available' ) }</Badge>

			<Tooltip
				context={ wrapperRef.current }
				isVisible={ showPopover }
				position="bottom"
				showDelay={ 300 }
				className="not-available-badge__tooltip"
			>
				{ restriction === 'atomic_site_selected'
					? translate( 'The selected site does not support this feature.' )
					: translate( 'One of the selected sites does not have a Basic plan.' ) }
			</Tooltip>
		</span>
	);
}
