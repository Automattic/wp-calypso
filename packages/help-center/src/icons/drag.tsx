const DragIcon = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="10"
			height="20"
			viewBox="0 0 15 25"
			className="help-center__drag-icon"
		>
			<g fill="var(--studio-gray-50)">
				<circle cx="3" cy="3" r="3" />
				<circle cx="3" cy="12" r="3" />
				<circle cx="3" cy="21" r="3" />
				<circle cx="12" cy="3" r="3" />
				<circle cx="12" cy="12" r="3" />
				<circle cx="12" cy="21" r="3" />
			</g>
		</svg>
	);
};

export default DragIcon;
