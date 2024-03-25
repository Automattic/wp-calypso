export const LOGO_COLOR_PRIMARY = '#040047';

type Props = {
	size?: number;
	className?: string;
};

const PressableLogo: React.FC< Props > = ( { size = 24 } ) => {
	const primaryColor = LOGO_COLOR_PRIMARY;

	return (
		<svg height={ size } id="Layer_2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72.3 72.3">
			<g id="pressable-logo">
				<g id="pressable-icon">
					<path
						fill={ primaryColor }
						d="m37,15.8h-10.8v19.8h10.8c8.6,0,10.6-1.8,10.6-9.3v-1.2c0-7.5-2.1-9.3-10.6-9.3Z"
					/>
					<path
						fill={ primaryColor }
						d="m0,0h0v72.3h46.3l26-26V0H0Zm54.2,26.3c0,11.7-4.4,15-17.2,15h-10.8v19.1c.1.9-.5,1.8-1.5,1.9h-.3c-1.5,0-4.7-.4-4.7-1.3V11.9c0-1.6.8-1.9,1.8-1.9h15.5c13,0,17.2,3.6,17.2,15v1.3Z"
					/>
				</g>
			</g>
		</svg>
	);
};

export default PressableLogo;
