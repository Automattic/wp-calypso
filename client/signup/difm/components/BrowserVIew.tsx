import styled from '@emotion/styled';

const Container = styled.div< { isSelected?: boolean } >`
	border: 3px solid
		${ ( { isSelected } ) => ( isSelected ? 'var( --studio-blue-50 )' : '#ffffff00' ) };
	border-radius: ${ ( { isSelected } ) => ( isSelected ? '10px' : '0' ) };
	&:hover {
		border: 3px solid var( --studio-blue-50 );
		border-radius: 10px;
	}
`;
const Header = styled.div`
	display: flex;
	align-items: center;
	justify-content: left;
	position: relative;
	max-width: 100%;
	height: 12px;
	border: 1px solid rgba( 0, 0, 0, 0.12 );
	border-radius: 6px 6px 0 0;
	margin: 0 auto;
	box-sizing: border-box;
	transition: max-width 0.2s ease-out;
	padding: 5px;
`;
const Content = styled.div`
	border: 1px solid rgba( 0, 0, 0, 0.12 );
	border-top: none;
	height: 158px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export function BrowserView( { isSelected }: { isSelected?: boolean } ) {
	return (
		<Container isSelected={ isSelected }>
			<Header>
				<svg width={ 16 } height={ 4 } fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M3.771 1.645c0 .909-.729 1.645-1.628 1.645-.9 0-1.629-.736-1.629-1.645C.514.737 1.244 0 2.143 0c.9 0 1.628.737 1.628 1.645ZM9.743 1.645c0 .909-.73 1.645-1.629 1.645-.9 0-1.628-.736-1.628-1.645C6.486.737 7.215 0 8.114 0c.9 0 1.629.737 1.629 1.645ZM15.714 1.645c0 .909-.729 1.645-1.628 1.645-.9 0-1.629-.736-1.629-1.645 0-.908.73-1.645 1.629-1.645s1.628.737 1.628 1.645Z"
						fill="#000"
						fillOpacity={ 0.12 }
					/>
				</svg>
			</Header>
			<Content>
				<svg width={ 186 } height={ 115 } fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect x={ 99 } y={ 12 } width={ 87 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 18 } width={ 87 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 24 } width={ 87 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 30 } width={ 81 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 42 } width={ 87 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 48 } width={ 87 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 54 } width={ 87 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 60 } width={ 81 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 70 } width={ 87 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 76 } width={ 87 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 82 } width={ 87 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 88 } width={ 81 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 94 } width={ 87 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 100 } width={ 87 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 106 } width={ 87 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect x={ 99 } y={ 112 } width={ 81 } height={ 3 } rx={ 1.5 } fill="#F6F7F7" />
					<rect width={ 83 } height={ 115 } rx={ 2 } fill="#F6F7F7" />
					<rect x={ 99 } width={ 46 } height={ 5 } rx={ 2 } fill="#F6F7F7" />
				</svg>
			</Content>
		</Container>
	);
}
