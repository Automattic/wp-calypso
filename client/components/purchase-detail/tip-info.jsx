/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import GridiconInfoOutline from 'gridicons/dist/info-outline';

const TipInfo = ( { info = '', className = '' } ) => {
	className += ' purchase-detail__info form-setting-explanation';
	return (
		<div className={ className }>
			<span className="purchase-detail__info-icon-container">
				<GridiconInfoOutline size={ 12 } />
			</span>
			{ info }
		</div>
	);
};

TipInfo.propTypes = {
	info: PropTypes.string,
	className: PropTypes.string,
};

export default TipInfo;
