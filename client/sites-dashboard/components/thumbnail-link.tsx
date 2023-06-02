import styled from '@emotion/styled';

export const ThumbnailLink = styled.a( {
	position: 'relative',
	':after': {
		content: '""',
		position: 'absolute',
		zIndex: -1,
		top: 0,
		left: 0,
		height: '100%',
		width: '100%',
		opacity: 0,
		borderRadius: '4px',
		boxShadow: '0 7px 30px -10px rgba( 0, 0, 0, 0.2 )',
		transition: 'opacity 0.3s',
	},
	':hover': {
		':after': {
			opacity: 1,
			transition: 'opacity 0.1s',
		},
	},
} );
