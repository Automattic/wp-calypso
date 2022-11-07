import { decodeEntities } from '@wordpress/html-entities';
import classnames from 'classnames';
import React from 'react';
import type { HorizontalBarListItemProps } from './types';

import './style.scss';

const BASE_CLASS_NAME = 'horizontal-bar-list';

const HorizontalBarListItem = ( {
	data,
	maxValue,
	url,
	onClick,
	hasIndicator,
	leftSideItem,
	rightSideItem,
}: HorizontalBarListItemProps ) => {
	const { label, value } = data;
	const fillPercentage = maxValue > 0 ? ( value / maxValue ) * 100 : 0;
	const isLink = url || onClick;

	const onClickHandler = ( e: React.MouseEvent ) => {
		e?.preventDefault();
		onClick?.( e );
	};

	const onKeyDownHandler = ( e: React.KeyboardEvent ) => {
		if ( e?.key !== 'Escape' && e?.key !== 'Tab' && e?.key !== 'Shift' ) {
			e?.preventDefault();
			onClick?.( e );
		}
	};

	const TagName = isLink ? 'a' : 'div'; // group parents and countries don't use anchors.
	const labelText = decodeEntities( label );

	// TODO: investivate `label` and `shortLabel`
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
			onClick={ ! url ? onClickHandler : undefined } // only execute onClick if url is not defined, otherwise anchor will be ignored
			onKeyDown={ ! url ? onKeyDownHandler : undefined }
		>
			<div className={ `${ BASE_CLASS_NAME }-item-bar` }>
				{ leftSideItem && <span>{ leftSideItem }</span> }
				<TagName className="label" href={ url } tabIndex={ 0 }>
					{ labelText }
				</TagName>
				{ /* // TODO: check if inner action links won't interfere with parent onClick */ }
				{ rightSideItem && (
					<span className={ `${ BASE_CLASS_NAME }--hover-action` }>{ rightSideItem }</span>
				) }
			</div>
			<div className="value">{ value }</div>
		</li>
	);
};

export default HorizontalBarListItem;
