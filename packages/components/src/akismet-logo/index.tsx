import classNames from 'classnames';

type Props = {
	className?: string;
	size?: number;
};

export function AkismetLogo( { className, size = 32 }: Props ) {
	const classes = classNames( 'akismet-logo', className );

	return (
		<svg className={ classes } height={ size } viewBox="0 0 500.3 88.2">
			<title>Akismet</title>
			<path
				fill="#5f8f3e"
				d="M50.52,9.72,75.6,75.6c2.16,5.64,5.52,7.68,11.16,8.16a1.52,1.52,0,0,1,1.44,1.68,1.61,1.61,0,0,1-1.56,1.68H59.16a1.64,1.64,0,0,1-1.68-1.68A1.55,1.55,0,0,1,59,83.76c2.76,0,5.88-.72,5.88-4.08a11.25,11.25,0,0,0-.84-4.08l-6-16c-.24-.72-.36-1-1.08-1H34.08c-3.6,0-8,0-10.08,4.56L18.48,75.6a9.5,9.5,0,0,0-1,3.6c0,4.32,5.64,4.56,8.64,4.56a1.55,1.55,0,0,1,1.56,1.68A1.64,1.64,0,0,1,26,87.12H1.68A1.64,1.64,0,0,1,0,85.44a1.54,1.54,0,0,1,1.56-1.68c5.88-.36,7.8-3.12,10.08-8.16L40.56,12.24c1.32-2.76,4.2-5.16,6.84-5.16C49.32,7.08,49.92,8.16,50.52,9.72Zm-22,43c-.24.48-.24.6-.24.72s.24.36.72.36H52.8c1.68,0,2.4-.36,2.4-1.44a3.7,3.7,0,0,0-.36-1.56L48.24,33c-1.56-4.08-3.84-9.48-4.56-13.92,0-.24-.12-.36-.24-.36s-.24.12-.24.36A54.37,54.37,0,0,1,39.72,28Z"
			/>
			<path
				fill="#5f8f3e"
				d="M120.26,16.68c0-4.56-4.08-6-10.32-6a4.7,4.7,0,0,1-.36-1.56,2.54,2.54,0,0,1,2.16-2.4,33.86,33.86,0,0,0,10.44-4.44C123.74,1.2,124.82,0,127,0a2.88,2.88,0,0,1,2.64,1.44l-1.8,53.4c0,.24,0,.36.12.36s.12-.12.36-.36L145.1,40c2.16-1.92,3-2.64,3-4.08,0-1.68-1.08-3.24-5.28-3.24A1.55,1.55,0,0,1,141.26,31c0-1.08.6-1.56,1.68-1.56h25.44A1.54,1.54,0,0,1,170.06,31a1.52,1.52,0,0,1-1.44,1.68c-6,.84-12,4.32-16.32,7.92l-16,13.68,14.52,15c2.76,2.88,5.64,6.24,9,8.76a16.75,16.75,0,0,0,10.2,3.84c1.44,0,2.4-.24,3.24-.24s.84.72.84,1.08a2.15,2.15,0,0,1-.6,1.56,13.94,13.94,0,0,1-2.64,2.16A17.83,17.83,0,0,1,163,88.2a16,16,0,0,1-9.72-3.12,43.1,43.1,0,0,1-7.32-7.44L128.3,57.12c-.24-.24-.24-.36-.36-.36s-.12.12-.12.36l-.6,17.64c0,5.28,3.48,8,8.76,8.88a1.82,1.82,0,0,1,1.56,1.8A1.55,1.55,0,0,1,135.86,87H109a1.6,1.6,0,0,1-1.68-1.56,1.72,1.72,0,0,1,1.56-1.8c6-.84,9.36-2.76,9.48-8.16Z"
			/>
			<path
				fill="#5f8f3e"
				d="M191.06,44.64c0-4.56-3.12-6.12-9.36-6.12a2.85,2.85,0,0,1-.36-1.44,2.51,2.51,0,0,1,2.16-2.4,29.13,29.13,0,0,0,9.6-4.44c1.44-1,2.64-2.28,4.68-2.28a2.5,2.5,0,0,1,2.64,1.56L199,71c0,6.6.72,11.4,8.52,12.6a1.72,1.72,0,0,1,1.56,1.8A1.55,1.55,0,0,1,207.38,87H180.5a1.51,1.51,0,0,1-1.56-1.56,1.63,1.63,0,0,1,1.44-1.8c8.4-1.08,9.48-5.16,9.72-12.48ZM202.22,7.08c0,4.32-2.64,6.84-7.08,6.84s-6.36-2.28-6.36-5.88c0-4.44,2.64-6.84,7-6.84C200.3,1.2,202.22,3.48,202.22,7.08Z"
			/>
			<path
				fill="#5f8f3e"
				d="M257.9,37.56c0,1.92-.36,6.12-.36,6.84a1.24,1.24,0,0,1-2.4.24c-1.44-7.68-7.8-11.28-13.92-11.28s-11,3-11,9,8.16,8.76,13.08,11c6.48,3.12,13.08,5.52,15.36,11.4a13.47,13.47,0,0,1,.84,5,16,16,0,0,1-1.08,5.88c-3.24,8.28-13,12.48-22.32,12.48-13.8,0-16.2-4.32-16.2-13.92V71.16a1,1,0,0,1,1.2-1.08c1,0,1.2.48,1.2.6,2.64,7.44,10.32,12,17.52,12,5.76,0,10.92-3,10.92-8.64,0-7.68-6.72-9.12-12.84-12.12-5.64-2.76-11.64-4.92-14.64-9.48A13.36,13.36,0,0,1,221.54,46a14.47,14.47,0,0,1,1.32-5.88C226,33.36,234.38,28,244.82,28S257.9,31.32,257.9,37.56Z"
			/>
			<path
				fill="#5f8f3e"
				d="M345,33.6c2.4,3.36,2.88,7.44,2.88,10.92,0,.36.12.48.24.48s.24-.12.36-.36C351.74,35.16,359.66,28,370.1,28c13.32,0,15.84,10.68,15.84,19.44l-.84,23.76c0,6.72,1,11.28,8.64,12.48a1.74,1.74,0,0,1,1.68,1.8,1.59,1.59,0,0,1-1.8,1.56H366.86a1.54,1.54,0,0,1-1.68-1.56,1.58,1.58,0,0,1,1.56-1.8c8.4-1.08,9.36-5.28,9.6-12.48l.6-18c0-8.16-1.44-16.68-11.28-16.68-12.24,0-17,11.4-17.4,21.6l-.48,13.08c0,6.72,1,11.28,8.64,12.48a1.65,1.65,0,0,1,1.56,1.8A1.55,1.55,0,0,1,356.3,87H329.42a1.51,1.51,0,0,1-1.56-1.56,1.56,1.56,0,0,1,1.44-1.8c8.4-1.08,9.48-5.28,9.72-12.48l.6-18c0-8.16-1.56-16.68-11.4-16.68-12.36,0-17,11.88-17.4,22.08l-.48,12.6c0,6.6.84,11.28,8.64,12.48a1.65,1.65,0,0,1,1.56,1.8A1.49,1.49,0,0,1,318.86,87H292.1a1.64,1.64,0,0,1-1.8-1.56,1.61,1.61,0,0,1,1.68-1.8c8.28-1.08,9.36-5.16,9.6-12.48l.84-25.92c0-4.68-4.08-6.12-10.44-6.12a3.62,3.62,0,0,1-.36-1.44,2.66,2.66,0,0,1,2.16-2.52,34.9,34.9,0,0,0,10.44-4.32c1.56-1.2,2.64-2.4,4.68-2.4A2.83,2.83,0,0,1,311.66,30l-1.2,14.52c0,.36.12.48.24.48s.24-.12.36-.36C314.78,34.8,322.46,28,332.66,28,338.78,28,342.62,30.36,345,33.6Z"
			/>
			<path
				fill="#5f8f3e"
				d="M449.42,43.8c0,2.16-.48,6.12-2.76,7.44C439.34,55.32,423,57,411.5,57c-.48,0-.6.24-.6.6a27.71,27.71,0,0,0,1.44,8.64c3,8.52,10,13,18.36,13a22.48,22.48,0,0,0,17.76-8.76,1.78,1.78,0,0,1,1.44-1,1.53,1.53,0,0,1,1.68,1.44,1.71,1.71,0,0,1-.24.72C446.42,82.8,436.46,88.2,427,88.2c-16-.12-23.64-13.56-23.64-26.52,0-15,10-33.72,28.68-33.72C442.1,28,449.42,35.28,449.42,43.8Zm-37.44,4a25.12,25.12,0,0,0-.6,2.52A19.45,19.45,0,0,0,411,52.8a.55.55,0,0,0,.6.48c9.36,0,28.56-3.36,28.56-6.48a12.4,12.4,0,0,0-12.24-12C419.66,34.8,414.14,40.92,412,47.76Z"
			/>
			<path
				fill="#5f8f3e"
				d="M469.1,37.68c0-.6-.24-.84-1.08-.84h-8.16a1.82,1.82,0,0,1-1.08-1.92,1.65,1.65,0,0,1,1.08-1.56c7.8-2.76,11.76-7.92,14.16-17.88a2.31,2.31,0,0,1,2.4-1.44c1.32,0,2.28.48,2.28,1.68l-.48,14c0,.48.12.84.84.84h18a2.43,2.43,0,0,1,1.44,2.16A2.38,2.38,0,0,1,496.7,35l-18.6,1.8L477,68.64c0,3,0,6.48,2.28,8.88a9.3,9.3,0,0,0,7,2.88c4,0,7.92-1.68,12-5.76a1.09,1.09,0,0,1,.84-.36,1.12,1.12,0,0,1,1.2,1.2,3.56,3.56,0,0,1-.48,1.32c-2.88,6.6-9.6,11.4-18.24,11.4a13.29,13.29,0,0,1-10-3.84C468.5,81.24,468,76.8,468,72.6Z"
			/>
			<path
				fill="#5f8f3e"
				d="M96.39,49.86c0,3.08-1.75,4.83-4.9,4.83s-4.41-1.61-4.41-4.06c0-3.08,1.82-4.83,4.9-4.83S96.39,47.48,96.39,49.86Z"
			/>
			<path
				fill="#5f8f3e"
				d="M281.09,49.86c0,3.08-1.75,4.83-4.9,4.83s-4.41-1.61-4.41-4.06c0-3.08,1.82-4.83,4.9-4.83S281.09,47.48,281.09,49.86Z"
			/>
		</svg>
	);
}
