interface ChevronUpIconProps {
	className?: string;
	size?: number;
}

export function ChevronUpIcon( { className, size = 24 }: ChevronUpIconProps ) {
	return (
		<svg
			className={ className }
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M18.0045 13.4451L12 7.9864L5.9955 13.4451L7.00451 14.5549L12 10.0136L16.9955 14.5549L18.0045 13.4451Z"
				fill="currentColor"
			/>
		</svg>
	);
}
