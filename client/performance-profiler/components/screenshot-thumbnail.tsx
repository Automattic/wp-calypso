import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';

const Container = styled.div`
	width: 370px;
	height: 255px;
	display: flex;
	justify-content: center;
	align-items: center;

	& > * {
		border: 1px solid var( --studio-gray-0 );
		border-radius: 6px;
	}
`;

const UnavailableScreenshot = styled.div`
	color: var( --studio-gray-50 );
	background-color: var( --studio-gray-0 );
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100%;
`;

export const ScreenshotThumbnail = ( props: { src: string | undefined; alt: string } ) => {
	const { src, alt, ...rest } = props;

	return (
		<Container>
			{ src === undefined ? (
				<UnavailableScreenshot>{ translate( 'Screenshot unavailable' ) }</UnavailableScreenshot>
			) : (
				<img style={ { maxHeight: '240px' } } src={ src } alt={ alt } { ...rest } />
			) }
		</Container>
	);
};
