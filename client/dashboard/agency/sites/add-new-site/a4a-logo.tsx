const LOGO_COLOR_PRIMARY = '#029CD7';
const LOGO_COLOR_SECONDARY = '#021A23';

/**
 * The Automattic for Agencies mark, inlined from the classic app's A4ALogo
 * (client/a8c-for-agencies/components/a4a-logo) because the dashboard does not
 * reuse Calypso client code.
 */
export default function A4ALogo( {
	size = 24,
	...props
}: { size?: number } & React.SVGProps< SVGSVGElement > ) {
	return (
		<svg
			width={ size }
			height={ size }
			viewBox="0 0 64 64"
			xmlns="http://www.w3.org/2000/svg"
			{ ...props }
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M53.6471 31.5984C53.6471 21.029 45.9236 11.6027 31.9584 11.6027C17.9933 11.6027 10.3514 21.029 10.3514 31.5984V32.9105C10.3514 43.4815 17.9933 53.0691 31.9584 53.0691C45.9236 53.0691 53.6471 43.4815 53.6471 32.9105V31.5984ZM31.9584 61.6733C12.5696 61.6733 0 47.7437 0 33.2378V31.4371C0 16.6838 12.5696 3 31.9584 3C51.4304 3 64 16.6838 64 31.4371V33.2378C64 47.7437 51.4304 61.6733 31.9584 61.6733Z"
				fill={ LOGO_COLOR_PRIMARY }
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M38.8263 22.3617C40.5964 23.5221 41.0927 25.934 39.9441 27.7441L30.9904 41.8447C29.8402 43.6563 27.4737 44.1803 25.7065 43.02C23.9394 41.8566 23.4372 39.4507 24.5888 37.6391L33.5425 23.5385C34.6926 21.7284 37.0591 21.2029 38.8263 22.3617Z"
				fill={ LOGO_COLOR_SECONDARY }
			/>
		</svg>
	);
}
