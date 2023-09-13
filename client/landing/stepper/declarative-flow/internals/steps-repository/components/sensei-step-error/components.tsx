import styled from '@emotion/styled';

function UnstyledErrorIcon( { className }: { className?: string } ) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			aria-hidden="true"
			className={ className }
		>
			<path
				fill="#FFFFFF"
				d="M11 15h2v2h-2v-2zm0-8h2v6h-2V7zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
			/>
		</svg>
	);
}

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	flex: 1;
`;

export const ErrorIcon = styled( UnstyledErrorIcon )`
	width: 40px;
	height: 40px;
	path {
		fill: var( --studio-orange-40 );
	}
`;

export const Title = styled.h1`
	font-family: Recoleta, sans-serif;
	font-size: 32px;
	line-height: 40px;
	margin: 40px;
`;

export const TryAgain = styled.button`
	font-size: 16px;
	line-height: 20px;
	cursor: pointer;
	color: #117ac9;
`;

export const ContactSupport = styled.p`
	font-size: 12px;
	line-height: 20px;
	margin: 40px 0;
`;
