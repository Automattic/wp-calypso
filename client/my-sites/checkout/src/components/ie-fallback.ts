import styled from '@emotion/styled';

export const LeftColumn = styled.div< { fullWidth?: boolean } >`
	-ms-grid-column: 1;
	-ms-grid-row: 1;
	${ ( props ) => props.fullWidth && 'grid-column: 1 / -1;' }
`;

export const RightColumn = styled.div`
	-ms-grid-column: 3;
	-ms-grid-row: 1;
`;
