import styled from '@emotion/styled';
import {
	PlansIntervalToggle as UnstyledPlansIntervalToggle,
	PlansIntervalToggleProps,
} from 'calypso/../packages/plans-grid/src';

export const Title = styled.h1`
	font-family: 'Recoleta';
	font-size: 36px;
	line-height: 40px;
	text-align: center;
	color: #101517;
	margin-top: 16px;

	@media ( min-width: 700px ) {
		font-size: 44px;
		line-height: 48px;
		margin-top: 72px;
	}
`;

export const Tagline = styled.p`
	font-size: 16px;
	line-height: 24px;
	letter-spacing: 0.24px;
	color: #50575e;
	margin-top: 8px;
	text-align: center;
`;

export const PlansIntervalToggle = styled(
	UnstyledPlansIntervalToggle
)< PlansIntervalToggleProps >`
	margin-top: 40px;
`;
