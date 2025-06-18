type HelpCenterTrianglePointerProps = {
	placement: 'above' | 'below' | 'left' | 'right';
	showTriangle: boolean;
	triangleLeft: number;
};

export const HelpCenterTrianglePointer = ( {
	placement,
	showTriangle,
	triangleLeft,
}: HelpCenterTrianglePointerProps ) => {
	if ( ! showTriangle || ( placement !== 'above' && placement !== 'below' ) ) {
		return null;
	}

	const triangleStyle: React.CSSProperties = {
		position: 'absolute',
		left: triangleLeft,
		transform: 'translateX(-50%)',
		width: 0,
		height: 0,
		borderLeft: '6px solid transparent',
		borderRight: '6px solid transparent',
	};

	const triangleTopStyle: React.CSSProperties = {
		...triangleStyle,
		bottom: -6,
		borderTop: '6px solid #fff',
	};

	const triangleBottomStyle: React.CSSProperties = {
		...triangleStyle,
		top: -6,
		borderBottom: '6px solid #fff',
	};

	return <div style={ placement === 'above' ? triangleTopStyle : triangleBottomStyle } />;
};
