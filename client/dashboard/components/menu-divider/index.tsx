import './style.scss';

function MenuDivider( { style }: { style?: React.CSSProperties } ) {
	return <div className="dashboard-menu-divider" style={ style } />;
}

export default MenuDivider;
