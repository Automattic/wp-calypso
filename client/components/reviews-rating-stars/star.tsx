import { recordTracksEvent } from '@automattic/calypso-analytics';
import React, { forwardRef } from 'react';

const vars = {
	gray5: 'var(--color-neutral-5)',
	yellow20: 'var(--color-warning-20)',
	yellow50: 'var(--color-warning)',
};

export type StarProps = {
	index?: number;
	rating: number;
	hoverRating: number;
	size?: number;
	title?: string;
	onClick?: ( ( e: React.MouseEvent | React.KeyboardEvent, index: number ) => void ) | null;
	className?: string;
	onMouseEnter?: ( index: number ) => void;
	onMouseLeave?: () => void;
	tracksEvent?: string;
	tracksProperties?: Record< string, unknown >;
	isChecked?: boolean;
	isInteractive?: boolean;
	ariaLabel?: string;
	tabIndex?: number;
	ariaHidden?: boolean;
};

const Star = forwardRef< SVGSVGElement, StarProps >( ( props, ref ) => {
	const {
		index = 0,
		rating,
		hoverRating,
		size = 24,
		title,
		onClick,
		className,
		onMouseEnter,
		onMouseLeave,
		tracksEvent,
		tracksProperties,
		isChecked,
		isInteractive,
		ariaLabel,
		tabIndex,
		ariaHidden,
	} = props;

	const classes = [ 'wccom-star', className ];
	classes.push( 'wccom-star__' + index );

	function handleOnClick( e: React.MouseEvent | React.KeyboardEvent, i: number ) {
		if ( ! isInteractive ) {
			return;
		}
		if ( 'click' === e.type || ( e as React.KeyboardEvent ).key === 'Enter' ) {
			if ( tracksEvent ) {
				const properties = Object.assign( {}, tracksProperties );
				properties.index = i;
				recordTracksEvent( tracksEvent, properties );
			}
			if ( 'function' === typeof onClick ) {
				onClick( e, index );
			}
		}
	}

	const svgProps: React.SVGProps< SVGSVGElement > = {
		className: classes.join( ' ' ),
		width: size,
		height: size,
		viewBox: '0 0 24 24',
		role: 'img',
		pointerEvents: 'all',
		onClick: ( e: React.MouseEvent ) => handleOnClick( e, index ),
		onKeyDown: ( e: React.KeyboardEvent ) => handleOnClick( e, index ),
		ref,
		'aria-label': ariaLabel,
		'aria-hidden': ariaHidden,
		tabIndex,
	};

	if ( onMouseEnter && onMouseLeave && onClick ) {
		svgProps.onMouseEnter = () => onMouseEnter( index );
		svgProps.onMouseLeave = onMouseLeave;
	}

	let titleId = '';
	if ( title ) {
		titleId = 'star-title-' + index;
		svgProps[ 'aria-labelledby' ] = titleId;
	}

	const onFill = isChecked ? vars.yellow50 : vars.yellow20;
	const offFill = vars.gray5;
	const gradientId = 'gradient_' + crypto.randomUUID();
	let gradientPercentage = 0;
	let halfFill = false;
	let fill = offFill;

	function getInteractiveFill() {
		if ( hoverRating >= index ) {
			return onFill;
		} else if ( ! hoverRating && rating >= index ) {
			return onFill;
		}

		return offFill;
	}

	// we don't memoize this because:
	// - it's not very expensive computation
	// - this component is used in Gutenberg editor output, so we can't use hooks
	const interactiveFill = getInteractiveFill();
	if ( isInteractive ) {
		fill = interactiveFill;
	} else if ( isChecked || rating >= index ) {
		fill = onFill;
	} else if ( Math.floor( rating ) === index - 1 && 0 < rating - Math.floor( rating ) ) {
		/*
		 If we are not in interactive mode, or not a fill we are at an empty star, we need to
		 determine if we are dealing with a decimal. We check that the rounded rating matches the
		 previous index, and then that the difference of the rating minus the previous index is
		 greater than 0. That is to say it is a decimal value like 0.1 - 0.9, we then convert that
		 decimal value to a percentage value.
		 */
		gradientPercentage = Math.floor( ( rating - Math.floor( rating ) ) * 100 );
		// If we have 50% or less we fill the star half via an svg gradient.
		if ( 50 >= gradientPercentage ) {
			halfFill = true;
			fill = 'url(#' + gradientId + ')';
		} else {
			// If we have more than 50% we just fill the star completely ie 4.6 = 5 stars.
			fill = onFill;
		}
	}

	return (
		<svg { ...svgProps }>
			{ title && <title id={ titleId }>{ title }</title> }
			{ halfFill && (
				<linearGradient id={ gradientId }>
					<stop offset="50%" stopColor={ onFill } />
					<stop offset="50%" stopColor={ offFill } stopOpacity="1" />
				</linearGradient>
			) }
			<path
				// eslint-disable-next-line max-len
				d="M11.6175 18.3126L17.4016 21.2832C17.9771 21.5788 18.6432 21.091 18.5352 20.4531L17.5256 14.4916L22.2421 9.44552C22.6687 8.98913 22.4178 8.24151 21.8023 8.13483L15.5158 7.04526L12.305 1.24251C12.006 0.702085 11.2291 0.702085 10.93 1.24251L7.71933 7.04526L1.43282 8.13483C0.817277 8.24151 0.566397 8.98913 0.992984 9.44552L5.70949 14.4916L4.69988 20.4531C4.59184 21.091 5.25798 21.5788 5.83352 21.2832L11.6175 18.3126Z"
				fill={ fill }
			/>
		</svg>
	);
} );

Star.defaultProps = {
	index: 1,
	size: 24,
	onClick: null,
	isChecked: false,
};

export default Star;
