const primary = '#069e08';
const secondary = '#ffffff';

export function JetpackLogo( { size }: { size: number } ) {
	return (
		<svg height={ size } width={ size } viewBox="0 0 32 32">
			<path fill={ primary } d="M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z" />
			<polygon fill={ secondary } points="15,19 7,19 15,3 " />
			<polygon fill={ secondary } points="17,29 17,13 25,13 " />
		</svg>
	);
}
