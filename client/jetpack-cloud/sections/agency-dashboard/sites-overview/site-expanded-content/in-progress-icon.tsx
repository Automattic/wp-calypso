import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import Tooltip from 'calypso/components/tooltip';

export default function InProgressIcon( { id }: { id: string } ) {
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
			<Tooltip id={ id } context={ iconRef.current } isVisible={ showTooltip } position="bottom">
				{ translate( 'Fetching Scores' ) }
			</Tooltip>
		</>
	);
}
