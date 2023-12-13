import { Gridicon, Tooltip } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';

export default function InProgressIcon() {
	const translate = useTranslate();

	const [ showTooltip, setShowTooltip ] = useState( false );
	const iconRef = useRef< HTMLElement | null >( null );

	return (
		<>
			<span
				ref={ iconRef }
				onMouseEnter={ () => setShowTooltip( true ) }
				onMouseLeave={ () => setShowTooltip( false ) }
			>
				<Gridicon icon="time" size={ 18 } className="site-expanded-content__progress-icon" />
			</span>
			<Tooltip context={ iconRef.current } isVisible={ showTooltip } position="bottom">
				{ translate( 'Fetching Scores' ) }
			</Tooltip>
		</>
	);
}
