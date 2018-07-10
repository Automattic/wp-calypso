
/**
 * Module constants
 */
const HEIGHT_OFFSET = 10; // used by the arrow and a bit of empty space
const isMobileViewport = () => window.innerWidth < 782;

/**
 * Utility used to compute the popover position over the xAxis
 *
 * @param {Object} anchorRect       Anchor Rect.
 * @param {Object} contentSize      Content Size.
 * @param {string} xAxis            Desired xAxis.
 * @param {string} chosenYAxis      yAxis to be used.
 * @param {boolean} expandOnMobile  Whether to expand the popover on mobile or not.
 *
 * @return {Object} Popover xAxis position and constraints.
 */
export function computePopoverXAxisPosition( anchorRect, contentSize, xAxis, chosenYAxis ) {
	const { width } = contentSize;

	// x axis alignment choices
	const anchorMidPoint = Math.round( anchorRect.left + ( anchorRect.width / 2 ) );
	const centerAlignment = {
		popoverLeft: anchorMidPoint,
		contentWidth: (
			( anchorMidPoint - ( width / 2 ) > 0 ? ( width / 2 ) : anchorMidPoint ) +
			( anchorMidPoint + ( width / 2 ) > window.innerWidth ? window.innerWidth - anchorMidPoint : ( width / 2 ) )
		),
	};
	const leftAlignmentX = chosenYAxis === 'middle' ? anchorRect.left : anchorMidPoint;
	const leftAlignment = {
		popoverLeft: leftAlignmentX,
		contentWidth: leftAlignmentX - width > 0 ? width : leftAlignmentX,
	};
	const rightAlignmentX = chosenYAxis === 'middle' ? anchorRect.right : anchorMidPoint;
	const rightAlignment = {
		popoverLeft: rightAlignmentX,
		contentWidth: rightAlignmentX + width > window.innerWidth ? window.innerWidth - rightAlignmentX : width,
	};

	// Choosing the x axis
	let chosenXAxis;
	let contentWidth = null;
	if ( xAxis === 'center' && centerAlignment.contentWidth === width ) {
		chosenXAxis = 'center';
	} else if ( xAxis === 'left' && leftAlignment.contentWidth === width ) {
		chosenXAxis = 'left';
	} else if ( xAxis === 'right' && rightAlignment.contentWidth === width ) {
		chosenXAxis = 'right';
	} else {
		chosenXAxis = leftAlignment.contentWidth > rightAlignment.contentWidth ? 'left' : 'right';
		const chosenWidth = chosenXAxis === 'left' ? leftAlignment.contentWidth : rightAlignment.contentWidth;
		contentWidth = chosenWidth !== width ? chosenWidth : null;
	}

	let popoverLeft;
	if ( chosenXAxis === 'center' ) {
		popoverLeft = centerAlignment.popoverLeft;
	} else if ( chosenXAxis === 'left' ) {
		popoverLeft = leftAlignment.popoverLeft;
	} else {
		popoverLeft = rightAlignment.popoverLeft;
	}

	return {
		xAxis: chosenXAxis,
		popoverLeft,
		contentWidth,
	};
}

/**
 * Utility used to compute the popover position over the yAxis
 *
 * @param {Object} anchorRect       Anchor Rect.
 * @param {Object} contentSize      Content Size.
 * @param {string} yAxis            Desired yAxis.
 * @param {boolean} expandOnMobile  Whether to expand the popover on mobile or not.
 *
 * @return {Object} Popover xAxis position and constraints.
 */
export function computePopoverYAxisPosition( anchorRect, contentSize, yAxis ) {
	const { height } = contentSize;

	// y axis alignment choices
	const anchorMidPoint = anchorRect.top + ( anchorRect.height / 2 );
	const middleAlignment = {
		popoverTop: anchorMidPoint,
		contentHeight: (
			( anchorMidPoint - ( height / 2 ) > 0 ? ( height / 2 ) : anchorMidPoint ) +
			( anchorMidPoint + ( height / 2 ) > window.innerHeight ? window.innerHeight - anchorMidPoint : ( height / 2 ) )
		),
	};
	const topAlignment = {
		popoverTop: anchorRect.top,
		contentHeight: anchorRect.top - HEIGHT_OFFSET - height > 0 ? height : anchorRect.top - HEIGHT_OFFSET,
	};
	const bottomAlignment = {
		popoverTop: anchorRect.bottom,
		contentHeight: anchorRect.bottom + HEIGHT_OFFSET + height > window.innerHeight ? window.innerHeight - HEIGHT_OFFSET - anchorRect.bottom : height,
	};

	// Choosing the y axis
	let chosenYAxis;
	let contentHeight = null;
	if ( yAxis === 'middle' && middleAlignment.contentHeight === height ) {
		chosenYAxis = 'middle';
	} else if ( yAxis === 'top' && topAlignment.contentHeight === height ) {
		chosenYAxis = 'top';
	} else if ( yAxis === 'bottom' && bottomAlignment.contentHeight === height ) {
		chosenYAxis = 'bottom';
	} else {
		chosenYAxis = topAlignment.contentHeight > bottomAlignment.contentHeight ? 'top' : 'bottom';
		const chosenHeight = chosenYAxis === 'top' ? topAlignment.contentHeight : bottomAlignment.contentHeight;
		contentHeight = chosenHeight !== height ? chosenHeight : null;
	}

	let popoverTop;
	if ( chosenYAxis === 'middle' ) {
		popoverTop = middleAlignment.popoverTop;
	} else if ( chosenYAxis === 'top' ) {
		popoverTop = topAlignment.popoverTop;
	} else {
		popoverTop = bottomAlignment.popoverTop;
	}

	return {
		yAxis: chosenYAxis,
		popoverTop,
		contentHeight,
	};
}

/**
 * Utility used to compute the popover position and the content max width/height for a popover
 * given its anchor rect and its content size.
 *
 * @param {Object} anchorRect       Anchor Rect.
 * @param {Object} contentSize      Content Size.
 * @param {string} position         Position.
 * @param {boolean} expandOnMobile  Whether to expand the popover on mobile or not.
 *
 * @return {Object} Popover position and constraints.
 */
export function computePopoverPosition( anchorRect, contentSize, position = 'top', expandOnMobile = false ) {
	const [ yAxis, xAxis = 'center' ] = position.split( ' ' );

	const yAxisPosition = computePopoverYAxisPosition( anchorRect, contentSize, yAxis );
	const xAxisPosition = computePopoverXAxisPosition( anchorRect, contentSize, xAxis, yAxisPosition.yAxis );

	return {
		isMobile: isMobileViewport() && expandOnMobile,
		...xAxisPosition,
		...yAxisPosition,
	};
}
