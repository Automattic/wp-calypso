/**
 * External dependencies
 */
import styled from 'styled-components';

export const SummaryDetails = styled.ul`
	margin: 8px 0 0 0;
	padding: 0;

	:first-child {
		margin-top: 0;
	}
`;

export const SummaryLine = styled.li`
	margin: 0;
	padding: 0;
	list-style: none;
`;

export const SummarySpacerLine = styled( SummaryLine )`
	margin-bottom: 8px;
`;
