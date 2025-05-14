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
			xmlns="http://www.w3.org/2000/svg"
			className={ className }
		>
			<g clip-path="url(#clip0_6677_162)">
				<path
					d="M125.275 96C61.952 151.947 -14.2017 300.396 48.294 316.872C166.434 348.016 277.997 154.178 335.94 200.515C425.78 272.36 79.0305 421.197 204.548 628"
					stroke="#98DBFF"
					stroke-width="4"
					stroke-linecap="round"
				/>
				<circle
					cx="213.464"
					cy="423.319"
					r="25.6991"
					fill="#98DBFF"
					stroke="#F6F7F7"
					stroke-width="17.2288"
				/>
			</g>
			<defs>
				<clipPath id="clip0_6677_162">
					<rect width="1069" height="762" fill="white" transform="translate(-3 -185)" />
				</clipPath>
			</defs>
		</svg>
	);
};

export default SignupSidebarImage;
