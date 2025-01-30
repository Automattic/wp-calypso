type Props = {
	className?: string;
	isDarkMode?: boolean;
};

const SignupSidebarImage = ( { className }: Props ) => {
	return (
		<svg
			width="381"
			height="577"
			viewBox="0 0 381 577"
			fill="none"
			className={ className }
			xmlns="http://www.w3.org/2000/svg"
		>
			<g>
				<path
					d="M125.275 96C61.952 151.947 -14.2017 300.396 48.294 316.872C166.434 348.016 277.997 154.178 335.94 200.515C425.78 272.36 79.0305 421.197 204.548 628"
					stroke="#98DBFF"
					strokeWidth="4"
					strokeLinecap="round"
				/>
				<circle cx="213.464" cy="423.319" r="25.6991" fill="#98DBFF" strokeWidth="17.2288" />
			</g>
		</svg>
	);
};

export default SignupSidebarImage;
