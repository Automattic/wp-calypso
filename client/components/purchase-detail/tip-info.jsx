/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

const TipInfo = ( { info = '', className = '' } ) => {
	className += ' purchase-detail__info form-setting-explanation';
	return(
		<div className={ className }>
			<span className="purchase-detail__info-icon-container">
				<Gridicon size={ 12 } icon="info-outline" />
				</span>
			{ info }
		</div>
	);
};

TipInfo.propTypes = {
	info: PropTypes.string,
	className: PropTypes.string
};

export default TipInfo;
