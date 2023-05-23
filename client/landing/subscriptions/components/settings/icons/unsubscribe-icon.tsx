type UnsubscribeIconProps = {
	className?: string;
};

const UnsubscribeIcon = ( { className }: UnsubscribeIconProps ) => (
	<svg
		className={ className }
		width="20"
		height="20"
		viewBox="0 0 20 20"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M4 4.5H16V11H17.5V4.5V3H16H4H2.5V4.5V15C2.5 16.1046 3.39543 17 4.5 17H11.5V15.5H4.5C4.22386 15.5 4 15.2761 4 15V4.5ZM14.5 6.5H5.5V8H14.5V6.5ZM9.5 9.5H5.5V11H9.5V9.5ZM13 11H12V12H13V11ZM12 9.5H10.5V11V12V13.5H12H13H14.5V12V11V9.5H13H12ZM9.5 12H5.5V13.5H9.5V12ZM19.75 17V15.5H13.75V17H19.75Z"
		/>
	</svg>
);

export default UnsubscribeIcon;
