import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';
import { ScreenShotsTimeLine } from 'calypso/data/site-profiler/types';

const Timeline = styled.div`
	display: flex;
	flex-direction: row;
	gap: 1.5rem;
	text-align: center;
`;

const H2 = styled.h2`
	font-weight: 500;
	font-size: 1.25rem;
`;

const Thumbnail = styled.img`
	border: 1px solid var( --studio-gray-0 );
	border-radius: 6px;
`;

type Props = { screenshots: ScreenShotsTimeLine[] };

export const ScreenshotTimeline = ( { screenshots }: Props ) => {
	if ( ! screenshots || ! screenshots.length ) {
		return null;
	}

	return (
		<div>
			<H2>Timeline</H2>
			<p>{ translate( 'Screenshots of your site loading taken while loading the page.' ) }</p>
			<Timeline>
				{ screenshots.map( ( screenshot, index ) => {
					const timing = `${ ( screenshot.timing / 1000 ).toFixed( 1 ) }s`;
					return (
						<div key={ index }>
							<Thumbnail alt={ timing } src={ screenshot.data } />
							<p>{ timing }</p>
						</div>
					);
				} ) }
			</Timeline>
		</div>
	);
};
