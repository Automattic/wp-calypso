import styled from '@emotion/styled';

const ThreeColumnContainer = styled.div`
	@media ( max-width: 960px ) {
		grid-template-columns: repeat( 1, 1fr );
	}

	@media ( max-width: 660px ) {
		padding: 0 16px;
	}

	display: grid;
	grid-template-columns: repeat( 3, 1fr );
	column-gap: 29px;
	row-gap: 10px;
`;

export default ThreeColumnContainer;
