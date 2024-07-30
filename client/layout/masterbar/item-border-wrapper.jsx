export default function ItemBorderWrapper( { isActive } ) {
	return (
		<div className={ `item-border-wrapper ${ isActive ? 'is-active' : '' }` }>
			<div className="item-border-wrapper__left">
				<div className="item-border-wrapper__interior-circle" />
			</div>
			<div className="item-border-wrapper__right">
				<div className="item-border-wrapper__interior-circle" />
			</div>
		</div>
	);
}
