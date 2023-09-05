import { translate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import BarChart from 'calypso/assets/images/icons/bar-chart.svg';
import SVGIcon from 'calypso/components/svg-icon';
import Tooltip from 'calypso/components/tooltip';
import './style.scss';

const ReaderViews = ( { viewCount } ) => {
	const buttonRef = useRef();
	const [ tooltip, setTooltip ] = useState( false );
	return (
		<div
			className="reader-views"
			ref={ buttonRef }
			onMouseEnter={ () => setTooltip( true ) }
			onMouseLeave={ () => setTooltip( false ) }
		>
			<SVGIcon classes="reader-views__icon" name="bar-chart" size="20" icon={ BarChart } />
			<span className="reader-views__view-count">{ viewCount }</span>
			<Tooltip isVisible={ tooltip } position="bottom left" context={ buttonRef.current }>
				{ translate( 'Views' ) }
			</Tooltip>
		</div>
	);
};

export default ReaderViews;
