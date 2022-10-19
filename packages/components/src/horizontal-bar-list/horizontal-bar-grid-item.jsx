import classnames from 'classnames';
import React from 'react';

import './style.scss';

const BASE_CLASS_NAME = 'horizontal-bar-list';

const HorizontalBarListItem = ( { data, maxValue, url, onClick, hasIndicator } ) => {
	const { label, value } = data;
	const fillPercentage = maxValue > 0 ? ( value / maxValue ) * 100 : 0;
	const isLink = url || onClick;

	const onClickHandler = ( e ) => {
		e?.preventDefault();
		onClick?.( e );
	};

	const onKeyDownHandler = ( e ) => {
		if ( e?.key !== 'Escape' || e?.key !== 'Tab' ) {
			e?.preventDefault();
			onClick?.( e );
		}
	};

	const TagName = isLink ? 'a' : 'div'; // group parents and countries don't use anchors.

	return (
		<li
			className={ classnames(
				`${ BASE_CLASS_NAME }-item`,
				isLink && `${ BASE_CLASS_NAME }-item--link`,
				hasIndicator && `${ BASE_CLASS_NAME }-item--indicated`
			) }
			style={ {
				[ `--${ BASE_CLASS_NAME }-fill` ]: `${ fillPercentage }%`,
			} }
			onClick={ ! url ? onClickHandler : null } // only execute onClick if url is not defined, otherwise anchor will be ignored
			onKeyDown={ ! url ? onKeyDownHandler : null }
		>
			<div className={ `${ BASE_CLASS_NAME }-item-bar` }>
				{ false && <span>Left items</span> }
				<TagName className="label" href={ ` ${ url ? url : null } ` }>
					{ label }
				</TagName>
				{ /* // TODO: check if inner action links won't interfere with parent onClick */ }
				{ false && <span>right items</span> }
			</div>
			<div className="value">{ value }</div>
		</li>
	);
};

export default HorizontalBarListItem;
