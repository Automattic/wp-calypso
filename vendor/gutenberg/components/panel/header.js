function PanelHeader( { label, children } ) {
	return (
		<div className="components-panel__header">
			{ label && <h2>{ label }</h2> }
			{ children }
		</div>
	);
}

export default PanelHeader;
