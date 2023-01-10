type ColorSwatchProps = {
	color?: string;
	className?: string;
};

const ColorSwatch = ( { color }: ColorSwatchProps ) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height={ 24 } width={ 24 }>
		<circle
			cx="12"
			cy="12"
			r="10"
			stroke="#000"
			strokeOpacity="0.2"
			strokeWidth="1"
			fill={ color ?? '#ccc' }
		></circle>
		{ ! color && <line x1="18" y1="4" x2="7" y2="20" stroke="#ccc" strokeWidth={ 1 } /> }
	</svg>
);

export default ColorSwatch;
