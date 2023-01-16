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
	renderRightSideItem,
	useShortLabel,
	isStatic,
}: HorizontalBarListItemProps ) => {
	const { label, value, shortLabel, children: itemChildren } = data;
	const fillPercentage = maxValue > 0 ? ( value / maxValue ) * 100 : 0;
	const isLink = url || ( onClick && ! itemChildren );
	const hasChildren = !! itemChildren;
	const [ open, setOpen ] = useState( false );

	const toggleOpen = ( e: React.MouseEvent ) => {
		e?.preventDefault();
		setOpen( ! open );
	};

	const toggleOpenKey = ( e: React.KeyboardEvent ) => {
		if ( e?.key === 'Enter' || e?.key === 'Space' ) {
			e?.preventDefault();
			setOpen( ! open );
		}
	};

	const onClickHandler = ( e: React.MouseEvent ) => {
		e?.preventDefault();
		onClick?.( e, data );
	};

	const onKeyDownHandler = ( e: React.KeyboardEvent ) => {
		if ( e?.key === 'Enter' || e?.key === 'Space' ) {
			e?.preventDefault();
			onClick?.( e, data );
		}
	};

	const TagName = isLink ? 'a' : 'div'; // group parents and countries don't use anchors.

	let labelText;

	// tags use an array for a label(s)
	if ( Array.isArray( label ) ) {
		labelText = label.length > 1 ? 'Tags' : label[ 0 ].label;
	} else {
		labelText = decodeEntities( useShortLabel ? shortLabel || '' : label ); // shortLabel as an empty string to make TS happy
	}

	let rowClick;
	let rowKeyPress;

	if ( hasChildren ) {
		rowClick = toggleOpen;
		rowKeyPress = toggleOpenKey;
	} else if ( ! url ) {
		rowClick = onClickHandler;
		rowKeyPress = onKeyDownHandler;
	}

	return (
		<>
			<li
				className={ classnames( `${ BASE_CLASS_NAME }-item`, {
					[ `${ BASE_CLASS_NAME }-item--indicated` ]: hasIndicator,
					[ `${ BASE_CLASS_NAME }-item--link` ]: isLink || hasChildren,
					[ `${ BASE_CLASS_NAME }-item--static` ]: isStatic,
				} ) }
				style={ {
					[ `--${ BASE_CLASS_NAME }-fill` ]: `${ fillPercentage }%`,
				} }
				onClick={ rowClick } // only execute onClick if url is not defined, otherwise anchor click will be ignored
				onKeyDown={ rowKeyPress }
				// eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
				role="button"
				tabIndex={ 0 }
			>
				<div className={ `${ BASE_CLASS_NAME }-item-bar` }>
					{ leftSideItem && <span>{ leftSideItem }</span> }
					<TagName
						className={ classnames(
							`${ BASE_CLASS_NAME }-label`,
							hasChildren && `${ BASE_CLASS_NAME }-label--group-header`
						) }
						href={ url }
						tabIndex={ 0 }
					>
						<span>{ labelText }</span>
						{ hasChildren && (
							<span className={ `${ BASE_CLASS_NAME }-group-toggle` }>
								<Icon icon={ open ? chevronUp : chevronDown } />
							</span>
						) }
					</TagName>
					{ renderRightSideItem && (
						<span className={ `${ BASE_CLASS_NAME }--hover-action` }>
							{ renderRightSideItem( data ) }
						</span>
					) }
				</div>
				<div className="value">{ numberFormat( value, 0 ) }</div>
			</li>
			{ itemChildren && open && (
				<li>
					<ul className={ `${ BASE_CLASS_NAME }-group` }>
						{ itemChildren?.map( ( child, index ) => {
							return (
								<HorizontalBarListItem
									key={ `group-${ child?.id || index }` }
									data={ child }
									maxValue={ maxValue }
									useShortLabel={ useShortLabel }
									renderRightSideItem={ renderRightSideItem }
									onClick={ ( e ) => onClick?.( e, child ) }
									hasIndicator={ hasIndicator }
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
