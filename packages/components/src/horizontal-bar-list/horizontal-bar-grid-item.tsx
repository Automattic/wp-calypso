import { decodeEntities } from '@wordpress/html-entities';
import { Icon, chevronDown, chevronUp } from '@wordpress/icons';
import classnames from 'classnames';
import { numberFormat } from 'i18n-calypso';
import React, { useState } from 'react';
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
	useShortLabel,
	isStatic,
}: HorizontalBarListItemProps ) => {
	const { label, value, shortLabel, children: itemChildren } = data;
	const fillPercentage = maxValue > 0 ? ( value / maxValue ) * 100 : 0;
	const isLink = url || ( onClick && ! itemChildren );
	const hasChildren = !! itemChildren;
	const [ open, setOpen ] = useState( false );

	const toggleOpen = ( e: React.MouseEvent | React.KeyboardEvent ) => {
		e?.preventDefault();
		setOpen( ! open );
	};

	const onClickHandler = ( e: React.MouseEvent ) => {
		e?.preventDefault();
		onClick?.( e, data );
	};

	const onKeyDownHandler = ( e: React.KeyboardEvent ) => {
		if ( e?.key !== 'Escape' && e?.key !== 'Tab' && e?.key !== 'Shift' ) {
			e?.preventDefault();
			onClick?.( e, data );
		}
	};

	const TagName = isLink ? 'a' : 'div'; // group parents and countries don't use anchors.
	const labelText = decodeEntities( useShortLabel ? shortLabel || '' : label ); // shortLabel as an empty string to make TS happy

	return (
		<>
			<li
				className={ classnames(
					`${ BASE_CLASS_NAME }-item`,
					isLink && `${ BASE_CLASS_NAME }-item--link`,
					hasIndicator && `${ BASE_CLASS_NAME }-item--indicated`,
					isStatic && `${ BASE_CLASS_NAME }-item--static`
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
						<span>{ labelText }</span>
						{ hasChildren && (
							<span role="button" onClick={ toggleOpen } onKeyDown={ toggleOpen } tabIndex={ 0 }>
								<Icon icon={ open ? chevronUp : chevronDown } />
							</span>
						) }
					</TagName>
					{ rightSideItem && (
						<span className={ `${ BASE_CLASS_NAME }--hover-action` }>
							{ rightSideItem( data ) }
						</span>
					) }
				</div>
				<div className="value">{ numberFormat( value, 0 ) }</div>
			</li>
			{ itemChildren && open && (
				<li>
					<ul style={ { listStyle: 'none', margin: `0 0 24px 0` } }>
						{ itemChildren?.map( ( child ) => {
							return (
								<HorizontalBarListItem
									data={ child }
									maxValue={ maxValue }
									useShortLabel={ useShortLabel }
									rightSideItem={ rightSideItem }
									onClick={ ( e ) => onClick?.( e, child ) }
									hasIndicator={ hasIndicator }
									// leftSideItem={leftSideItem}
									isStatic={ isStatic }
								/>
							);
						} ) }
					</ul>
				</li>
			) }
		</>
	);
};

export default HorizontalBarListItem;
