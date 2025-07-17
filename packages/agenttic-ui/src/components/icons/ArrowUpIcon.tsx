interface ArrowUpIconProps {
	className?: string;
	size?: number;
}

export function ArrowUpIcon( { className, size = 24 }: ArrowUpIconProps ) {
	return (
		<svg
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={ className }
		>
			<path
				d="M12.2197 5C12.4186 5 12.6094 5.07902 12.75 5.21967L17 9.46967C17.2929 9.76256 17.2929 10.2374 17 10.5303C16.7071 10.8232 16.2322 10.8232 15.9393 10.5303L12.9697 7.56067V18.25C12.9697 18.6642 12.6339 19 12.2197 19C11.8055 19 11.4697 18.6642 11.4697 18.25V7.56065L8.5 10.5303C8.2071 10.8232 7.73223 10.8232 7.43934 10.5303C7.14644 10.2374 7.14645 9.76256 7.43934 9.46967L11.6894 5.21967C11.83 5.07902 12.0208 5 12.2197 5Z"
				fill="currentColor"
			/>
		</svg>
	);
}
