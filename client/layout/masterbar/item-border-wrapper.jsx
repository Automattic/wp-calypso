export default function ItemBorderWrapper( { isActive, children } ) {
	return (
		<div className={ `item-border-wrapper ${ isActive ? 'is-active' : '' }` }>
			<div className="item-border-wrapper__left">
				<div className="item-border-wrapper__interior-circle" />
			</div>
			{ children }
			<div className="item-border-wrapper__right">
				<div className="item-border-wrapper__interior-circle" />
			</div>
		</div>
	);
}
