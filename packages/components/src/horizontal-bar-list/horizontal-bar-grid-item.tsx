import { decodeEntities } from '@wordpress/html-entities';
import { Icon, chevronDown, chevronUp, tag, file } from '@wordpress/icons';
import clsx from 'clsx';
import { numberFormat } from 'i18n-calypso';
import React, { Fragment, useState } from 'react';
import ShortenedNumber from '../number-formatters';
import type { HorizontalBarListItemProps } from './types';

import './style.scss';

const BASE_CLASS_NAME = 'horizontal-bar-list';

const HorizontalBarListItem = ( {
	data,
	className,
	maxValue,
	url,
	onClick,
	hasIndicator,
	leftSideItem,
	renderLeftSideItem,
	renderRightSideItem,
	useShortLabel,
	useShortNumber,
	leftGroupToggle,
	isStatic,
	additionalColumns,
	usePlainCard,
	isLinkUnderlined,
	hasNoBackground,
	formatValue,
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
		// combine all items into one
		labelText = (
			<>
				{ label.length > 1
					? label.map( ( item, index ) => (
							<Fragment key={ index }>
								<Icon
									className="stats-icon"
									icon={ item.labelIcon === 'folder' ? file : tag }
									size={ 22 }
								/>
								<span>{ decodeEntities( item.label ) }</span>
							</Fragment>
					  ) )
					: label[ 0 ].label }
			</>
		);
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

	const groupChevron = (
		<span className={ `${ BASE_CLASS_NAME }-group-toggle` }>
			<Icon icon={ open ? chevronUp : chevronDown } />
		</span>
	);

	const renderValue = () => {
		if ( useShortNumber ) {
			return <ShortenedNumber value={ value } />;
		}
		if ( formatValue ) {
			return formatValue( value, data );
		}

		return usePlainCard ? value : numberFormat( value, { decimals: 0 } );
	};

	return (
		<>
			<li
				className={ clsx(
					`${ BASE_CLASS_NAME }-item`,
					{
						[ `${ BASE_CLASS_NAME }-item--indicated` ]: hasIndicator,
						[ `${ BASE_CLASS_NAME }-item--link` ]: isLink || hasChildren,
						[ `${ BASE_CLASS_NAME }-item--link-underlined` ]: isLinkUnderlined,
						[ `${ BASE_CLASS_NAME }-item--static` ]: isStatic,
						[ `${ BASE_CLASS_NAME }-item--no-bg` ]: hasNoBackground,
					},
					className
				) }
				style={
					! usePlainCard
						? ( {
								[ `--${ BASE_CLASS_NAME }-fill` ]: `${ fillPercentage }%`,
						  } as React.CSSProperties )
						: {}
				}
				onClick={ rowClick } // only execute onClick if url is not defined, otherwise anchor click will be ignored
				onKeyDown={ rowKeyPress }
				// eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
				role="button"
				tabIndex={ 0 }
			>
				<div className={ `${ BASE_CLASS_NAME }-item-bar` }>
					{ ( leftSideItem || ( renderLeftSideItem && renderLeftSideItem?.( data ) ) ) && (
						<span className={ `${ BASE_CLASS_NAME }-item__left-icon` }>
							{ leftSideItem ? leftSideItem : renderLeftSideItem?.( data ) }
						</span>
					) }
					<TagName
						className={ clsx(
							`${ BASE_CLASS_NAME }-label`,
							hasChildren && `${ BASE_CLASS_NAME }-label--group-header`
						) }
						href={ url }
						tabIndex={ 0 }
					>
						{ leftGroupToggle && hasChildren && groupChevron }
						<span className={ `${ BASE_CLASS_NAME }__group-label` }>{ labelText }</span>
						{ ! leftGroupToggle && hasChildren && groupChevron }
					</TagName>
					{ renderRightSideItem && (
						<span className={ `${ BASE_CLASS_NAME }--hover-action` }>
							{ renderRightSideItem( data ) }
						</span>
					) }
					{ additionalColumns && (
						<div className={ `${ BASE_CLASS_NAME }-item--additional` }>{ additionalColumns }</div>
					) }
				</div>
				<div className="value">{ renderValue() }</div>
			</li>
			{ itemChildren && open && (
				<li>
					<ul className={ `${ BASE_CLASS_NAME }-group` }>
						{ itemChildren?.map( ( child, index ) => {
							if ( child.value === null ) {
								child.value = value; // take parent's value
							}

							return (
								<HorizontalBarListItem
									key={ `group-${ child?.id ?? index }` }
									data={ child }
									className={ className }
									maxValue={ maxValue }
									useShortLabel={ useShortLabel }
									useShortNumber={ useShortNumber }
									renderLeftSideItem={ renderLeftSideItem }
									renderRightSideItem={ renderRightSideItem }
									onClick={ ( e ) => onClick?.( e, child ) }
									hasIndicator={ hasIndicator }
									isStatic={ isStatic }
									usePlainCard={ usePlainCard }
									isLinkUnderlined={ isLinkUnderlined }
									formatValue={ formatValue }
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
