import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';
import { type TabType, TabTypes } from './header';

const Container = styled.div< { activeTab: TabType } >`
	flex: ${ ( props ) => ( props.activeTab === TabTypes.desktop ? '0 300px' : null ) };
	height: 280px;
	display: flex;
	align-items: center;

	& > * {
		border: 1px solid var( --studio-gray-5 );
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

const ScreenShot = styled.img`
	max-height: 100%;
`;

export const ScreenshotThumbnail = ( props: {
	src: string | undefined;
	alt: string;
	activeTab: TabType;
} ) => {
	const { src, alt, activeTab, ...rest } = props;

	return (
		<Container activeTab={ activeTab }>
			{ src === undefined ? (
				<UnavailableScreenshot>{ translate( 'Screenshot unavailable' ) }</UnavailableScreenshot>
			) : (
				<ScreenShot src={ src } alt={ alt } { ...rest } />
			) }
		</Container>
	);
};
