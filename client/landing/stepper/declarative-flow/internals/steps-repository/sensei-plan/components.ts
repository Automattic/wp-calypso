import styled from '@emotion/styled';
import {
	PlansIntervalToggle as UnstyledPlansIntervalToggle,
	PlansIntervalToggleProps,
} from 'calypso/../packages/plans-grid/src';

export interface ExtendedPlansIntervalToggleProps extends PlansIntervalToggleProps {
	loading: boolean;
}

export const PlansIntervalToggle = styled(
	UnstyledPlansIntervalToggle
)< ExtendedPlansIntervalToggleProps >`
	margin-top: 32px;

	${ ( props ) =>
		props.loading &&
		`
		animation: onboarding-loading-pulse 1.6s ease-in-out infinite;
		background-color: #f0f0f0;

		& > .segmented-control {
			visibility: hidden;
		}
		` }
`;
