import { useRef, useState } from 'react';
import Tooltip from 'calypso/components/tooltip';

interface Props {
	feature: string;
	tooltipText: string;
}

export default function FeatureItem( { feature, tooltipText }: Props ) {
	const tooltipRef = useRef< HTMLDivElement | null >( null );
	const [ showPopover, setShowPopover ] = useState( false );

	return (
		<>
			<div
				onMouseEnter={ () => setShowPopover( true ) }
				onMouseLeave={ () => setShowPopover( false ) }
				onMouseDown={ () => setShowPopover( false ) }
				role="button"
				tabIndex={ 0 }
				ref={ tooltipRef }
				className="wpcom-atomic-hosting__card-feature"
			>
				{ feature }
			</div>
			<Tooltip
				context={ tooltipRef.current }
				isVisible={ showPopover && !! tooltipText }
				position="top"
			>
				{ tooltipText }
			</Tooltip>
		</>
	);
}
