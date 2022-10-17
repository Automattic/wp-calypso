// import classnames from 'classnames';
import React from 'react';

import './style.scss';

const BASE_CLASS_NAME = 'horizontalbarlist';

const HorizontalBarListItem = ( { data, referenceValue } ) => {
	const { label, value } = data;
	const fillPercentage = referenceValue > 0 ? ( value / referenceValue ) * 100 : 0;

	return (
		<li
			className={ `${ BASE_CLASS_NAME }-item` }
			style={ {
				[ `--${ BASE_CLASS_NAME }-fill` ]: `${ fillPercentage }%`,
			} }
		>
			<div className={ `${ BASE_CLASS_NAME }-item-bar` }>
				{ false && <span>Left items</span> }
				<span className="label">{ label }</span>
				{ false && <span>right items</span> }
			</div>
			<div className="value">{ value }</div>
		</li>
	);
};

export default HorizontalBarListItem;
