import styled from '@emotion/styled';

const CheckIconSvg = styled.svg`
	fill: #fff;
`;

export function CheckIcon( { className }: { className?: string } ) {
	return (
		<CheckIconSvg
			width="16"
			height="20"
			viewBox="0 0 20 20"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className={ className }
		>
			<path d="M7.32916 13.2292L3.85416 9.75417L2.67083 10.9292L7.32916 15.5875L17.3292 5.58751L16.1542 4.41251L7.32916 13.2292Z" />
		</CheckIconSvg>
	);
}
