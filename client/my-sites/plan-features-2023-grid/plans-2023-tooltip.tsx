import styled from '@emotion/styled';
import { TranslateResult } from 'i18n-calypso';
import { PropsWithChildren } from 'react';

const TooltipContainer = styled.div`
	position: relative;
	cursor: default;
`;
const Tooltip = styled.div`
	background: #101517;
	border-radius: 4px;
	font-size: 12px;
	color: #fff;
	display: block;
	width: 245px;
	position: absolute;
	padding: 8px 10px;
	box-shadow: 0 1px 2px rgb( 0 0 0 / 5% );
	font-weight: 400;
	text-align: center;
	pointer-events: none;
	z-index: 55;
	transition: opacity 0.2s ease;
	left: -18px;
	top: -55px;
	opacity: 0;
	${ TooltipContainer }:hover & {
		opacity: 1;
	}
`;

export const Plans2023Tooltip = ( props: PropsWithChildren< { text?: TranslateResult } > ) => {
	if ( ! props.text ) {
		return <>{ props.children }</>;
	}
	return (
		<TooltipContainer className="plans-tooltip">
			{ props.children }
			<Tooltip>{ props.text }</Tooltip>
		</TooltipContainer>
	);
};
