import { Gridicon } from '@automattic/components';
import PropTypes from 'prop-types';
import { useState, useRef } from 'react';
import Tooltip from 'calypso/components/tooltip';

function LanguagePickerItemTooltip( { children } ) {
	const [ isVisible, setVisible ] = useState( false );
	const tooltipContainer = useRef( null );

	const showTooltip = () => setVisible( true );
	const hideTooltip = () => setVisible( false );

	return (
		<i
			className="language-picker__modal-item-notice"
			onMouseEnter={ showTooltip }
			onMouseLeave={ hideTooltip }
		>
			<Gridicon ref={ tooltipContainer } icon="notice-outline" size={ 18 } />

			<Tooltip
				className="language-picker__modal-tooltip"
				isVisible={ isVisible }
				context={ tooltipContainer && tooltipContainer.current }
			>
				{ children }
			</Tooltip>
		</i>
	);
}

LanguagePickerItemTooltip.propTypes = {
	children: PropTypes.node.isRequired,
};

export default LanguagePickerItemTooltip;
