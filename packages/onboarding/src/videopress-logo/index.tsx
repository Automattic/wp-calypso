type Props = {
	className?: string;
	size?: number;
};

const VideoPressLogo: React.FunctionComponent< Props > = ( {
	className = 'videopress-logo',
	size = 24,
} ) => {
	return (
		<svg
			className={ className }
			height={ size }
			width={ size }
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g clipPath="url(#clip0_817_8325)">
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM7.13433 8.15456C6.93894 7.4713 6.3119 7 5.59826 7C4.51438 7 3.7453 8.05189 4.07851 9.07862L6.43154 16.3292C6.80857 17.4909 7.89509 18.2781 9.12151 18.2781C10.3479 18.2781 11.4344 17.4909 11.8115 16.3292L12.2319 15.0337H14.3959H16.0752C18.6214 15.0337 20.328 13.4995 20.328 11.0392C20.328 8.60674 18.665 7 16.1842 7H12.6448H11.3643L9.07552 14.929C9.07144 14.9236 9.06828 14.9173 9.06634 14.9104L7.13433 8.15456ZM15.4645 12.6236H13.014L14.0352 9.47706H15.4645C16.5277 9.47706 17.1656 10.0573 17.1656 11.0392C17.1656 12.0155 16.5277 12.6236 15.4645 12.6236Z"
					fill="white"
				/>
			</g>
			<defs>
				<clipPath id="clip0_817_8325">
					<rect width="24" height="24" fill="white" />
				</clipPath>
			</defs>
		</svg>
	);
};

export default VideoPressLogo;
