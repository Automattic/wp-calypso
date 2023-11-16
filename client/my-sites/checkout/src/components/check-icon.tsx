import styled from '@emotion/styled';

const CheckIconSvg = styled.svg`
	fill: #fff;
`;

export function CheckIcon( { className, id }: { className?: string; id: string } ) {
	return (
		<CheckIconSvg
			width="16"
			height="20"
			viewBox="0 0 20 20"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className={ className }
		>
			<mask
				id={ id + '-check-icon-mask' }
				mask-type="alpha"
				maskUnits="userSpaceOnUse"
				x="2"
				y="4"
				width="16"
				height="12"
			>
				<path d="M7.32916 13.2292L3.85416 9.75417L2.67083 10.9292L7.32916 15.5875L17.3292 5.58751L16.1542 4.41251L7.32916 13.2292Z" />
			</mask>
			<g mask={ 'url(#' + id + '-check-icon-mask)' }>
				<rect width="20" height="20" />
			</g>
		</CheckIconSvg>
	);
}
