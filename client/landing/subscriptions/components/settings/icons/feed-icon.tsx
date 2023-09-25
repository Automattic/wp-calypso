const FeedIcon = ( props: { className: string } ) => (
	<svg
		className={ props.className }
		width="16"
		height="14"
		viewBox="0 0 16 14"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M2 1.5H14V12C14 12.2761 13.7761 12.5 13.5 12.5H2.5C2.22386 12.5 2 12.2761 2 12V1.5ZM0.5 0H2H14H15.5V1.5V12C15.5 13.1046 14.6046 14 13.5 14H2.5C1.39543 14 0.5 13.1046 0.5 12V1.5V0ZM3.5 3.5H12.5V5H3.5V3.5ZM3.5 6.5H7.5V8H3.5V6.5ZM10 8H11V9H10V8ZM8.5 6.5H10H11H12.5V8V9V10.5H11H10H8.5V9V8V6.5ZM3.5 9H7.5V10.5H3.5V9Z"
			fill="#3C434A"
		/>
	</svg>
);

export default FeedIcon;
