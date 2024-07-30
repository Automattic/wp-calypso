export default function ItemBorderWrapper( { isActive, children } ) {
	return (
		<div className={ `item-border-wrapper ${ isActive ? 'is-active' : '' }` }>
			{ /* square with the white background - relative absolute position this on the bottom left */ }
			<div className="item-border-wrapper__left">
				{ /* black circle to cut the curve - centered in square above. */ }
				<div className="item-border-wrapper__interior-circle" />
				{ /* black rectangles to cut off the still exposed top and undesired side of the outer square. */ }
				<div className="item-border-wrapper__interior-top-cutoff" />
				<div className="item-border-wrapper__interior-bottom-cutoff" />
			</div>
			{ children }
			{ /* square with the white background - relative absolute position this on the bottom right */ }
			<div className="item-border-wrapper__right">
				{ /* black circle to cut the curve - centered in square above. */ }
				<div className="item-border-wrapper__interior-circle" />
				{ /* black rectangles to cut off the still exposed top and undesired side of the outer square. */ }
				<div className="item-border-wrapper__interior-top-cutoff" />
				<div className="item-border-wrapper__interior-bottom-cutoff" />
			</div>
		</div>
	);
}
