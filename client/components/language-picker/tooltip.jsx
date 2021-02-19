/**
 * External dependencies
 */
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
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
	children: PropTypes.oneOfType( [ PropTypes.arrayOf( PropTypes.node ), PropTypes.node ] )
		.isRequired,
};

export default LanguagePickerItemTooltip;
