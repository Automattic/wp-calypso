type Props = {
	className?: string;
};

const NewSiteIcon: React.FunctionComponent< Props > = ( { className = '' } ) => {
	return (
		<svg
			className={ className }
			width="25"
			height="24"
			viewBox="0 0 25 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M19 5.5V8H20.5V5.5H23V4H20.5V1.5H19V4H16.5V5.5H19ZM14.4624 4H6.5C5.39543 4 4.5 4.89543 4.5 6V18C4.5 19.1046 5.39543 20 6.5 20H18.5C19.6046 20 20.5 19.1046 20.5 18V10.0391H19V18C19 18.2761 18.7761 18.5 18.5 18.5H10.5L10.5 10.4917L16.9589 10.5139L16.9641 9.01389L6 8.97618V6C6 5.72386 6.22386 5.5 6.5 5.5H14.4624V4ZM6 10.4762V18C6 18.2761 6.22386 18.5 6.5 18.5H9L9 10.4865L6 10.4762Z"
				fill="#3C434A"
			/>
		</svg>
	);
};

export default NewSiteIcon;
