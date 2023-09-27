const FeedIcon = ( props: { className?: string } ) => (
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			className={ props.className }
			fillRule="evenodd"
			clipRule="evenodd"
			d="M4 4.5H16V15C16 15.2761 15.7761 15.5 15.5 15.5H4.5C4.22386 15.5 4 15.2761 4 15V4.5ZM2.5 3H4H16H17.5V4.5V15C17.5 16.1046 16.6046 17 15.5 17H4.5C3.39543 17 2.5 16.1046 2.5 15V4.5V3ZM5.5 6.5H14.5V8H5.5V6.5ZM5.5 9.5H9.5V11H5.5V9.5ZM12 11H13V12H12V11ZM10.5 9.5H12H13H14.5V11V12V13.5H13H12H10.5V12V11V9.5ZM5.5 12H9.5V13.5H5.5V12Z"
			fill="#3C434A"
		/>
	</svg>
);

export default FeedIcon;
