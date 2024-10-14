import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';
import { ScreenShotsTimeLine } from 'calypso/data/site-profiler/types';

const Container = styled.div`
	width: 100%;
	box-sizing: border-box;
	border: 1px solid var( --studio-gray-5 );
	padding: 24px;
	border-radius: 4px;
	overflow: hidden;
`;

const Timeline = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	gap: 1.5rem;
	text-align: center;
	overflow: auto;
	padding: 0 2px;
`;

const H2 = styled.h2`
	font-weight: 500;
	font-size: 1rem;
	margin-bottom: 8px;
`;

const Thumbnail = styled.img`
	border: 1px solid var( --studio-gray-0 );
	border-radius: 6px;
	width: 100%;
	min-width: 60px;
`;

const Tick = styled.p`
	margin: 6px 0 0;
	color: var( --studio-gray-80 );
	font-size: 0.875rem;
`;

type Props = { screenshots: ScreenShotsTimeLine[] };

export const ScreenshotTimeline = ( { screenshots }: Props ) => {
	if ( ! screenshots || ! screenshots.length ) {
		return null;
	}

	return (
		<Container>
			<H2>{ translate( 'Timeline' ) }</H2>
			<p>{ translate( 'How your site appears to users while loading.' ) }</p>
			<Timeline>
				{ screenshots.map( ( screenshot, index ) => {
					const timing = `${ ( screenshot.timing / 1000 ).toFixed( 1 ) }s`;
					return (
						<div key={ index }>
							<Thumbnail alt={ timing } src={ screenshot.data } />
							<Tick>{ timing }</Tick>
						</div>
					);
				} ) }
			</Timeline>
		</Container>
	);
};
