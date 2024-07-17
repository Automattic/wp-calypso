const DragIcon = () => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="8"
			height="12"
			viewBox="0 0 10 24"
			className="help-center__drag-icon"
		>
			<g fill="var(--studio-gray-20)">
				<circle cx="0" cy="3" r="3" />
				<circle cx="0" cy="12" r="3" />
				<circle cx="0" cy="21" r="3" />
				<circle cx="10" cy="3" r="3" />
				<circle cx="10" cy="12" r="3" />
				<circle cx="10" cy="21" r="3" />
			</g>
		</svg>
	);
};

export default DragIcon;
