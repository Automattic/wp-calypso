type TurnIntoSubscribersIconProps = {
	className?: string;
};

const TurnIntoSubscribersIcon = ( { className }: TurnIntoSubscribersIconProps ) => (
	<svg
		className={ className }
		width="10"
		height="13"
		viewBox="0 0 10 13"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path d="M4.375 0.166748H5.625V12.6667H4.375V0.166748Z" fill="#1E1E1E" />
		<path d="M0 4.33341H1.25V12.6667H0V4.33341Z" fill="#1E1E1E" />
		<path d="M10 7.66675H8.75V12.6667H10V7.66675Z" fill="#1E1E1E" />
	</svg>
);

export default TurnIntoSubscribersIcon;
