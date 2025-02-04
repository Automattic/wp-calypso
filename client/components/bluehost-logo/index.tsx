type Props = {
	size?: number;
};

export default function BluehostLogo( { size = 12 }: Props ) {
	return (
		<svg
			className="gridicon bluehost-logo"
			width={ `${ size }px` }
			height={ `${ size }px` }
			viewBox="0 0 1024 1024"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle cx="512" cy="512" r="512" fill="#0076ff" />
			<path
				d="M303.9 303.4h116.2v116.2H303.9V303.4zm149.8 0h116.2v116.2H453.7V303.4zm150.2 0h116.2v116.2H603.9V303.4zm-300 150.5h116.2v116.2H303.9V453.9zm149.8 0h116.2v116.2H453.7V453.9zm150.2 0h116.2v116.2H603.9V453.9zm-300 150.5h116.2v116.2H303.9V604.4zm149.8 0h116.2v116.2H453.7V604.4zm150.2 0h116.2v116.2H603.9V604.4z"
				fill="#fff"
			/>
		</svg>
	);
}
