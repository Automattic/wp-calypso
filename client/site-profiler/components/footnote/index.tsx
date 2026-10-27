import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { LayoutBlock } from 'calypso/site-profiler/components/layout';

const StyledLayoutBlock = styled( LayoutBlock )`
	.l-block-wrapper {
		display: flex;
		gap: 90px;
		justify-content: space-between;
		align-items: flex-end;

		@media ( max-width: 980px ) {
			flex-direction: column;
			align-items: flex-start;
			gap: 30px;
		}
	}
`;

const Description = styled.ul`
	margin: 0;
	max-width: 760px;
	li {
		color: var( --studio-gray-50 );
		font-size: 11px;
		line-height: 18px;
		margin-bottom: 18px;
	}
`;
const Link = styled.div`
	color: var( --studio-white );
	text-decoration: none;
	font-size: 12px;
	flex-shrink: 0;
	margin-bottom: 18px; // same as the last li margin-bottom
	&:hover {
		text-decoration: underline;
		color: var( --studio-white );
		cursor: pointer;
	}
`;
const LinkIcon = styled( Gridicon )`
	transform: translate( 0, 5px );
	margin-left: 8px;
`;

const onLearnMoreClick = () => {
	recordTracksEvent( 'calypso_site_profiler_cta', {
		cta_name: 'crux_learn_more',
	} );
	window.open( 'https://developer.chrome.com/docs/crux', '_blank' );
};

export const FootNote = () => {
	const translate = useTranslate();

	return (
		<StyledLayoutBlock width="medium">
			<Description>
				<li>
					{ translate(
						"The performance data and metrics presented in this site are sourced from the Google Chrome User Experience Report (CrUX) dataset, which reflects real-world user experiences and interactions with your site. This data helps us provide actionable insights to improve your site's performance."
					) }
				</li>
				<li>
					{ translate(
						'While we strive to provide accurate and helpful insights, please note that performance improvements are dependent on various factors, including your current setup and specific use case. Our recommendations aim to guide you towards potential enhancements, but results may vary.'
					) }
				</li>
			</Description>
			<Link onClick={ onLearnMoreClick }>
				{ translate( 'Learn more about the Chrome UX Report' ) }
				<LinkIcon icon="external" size={ 20 } />
			</Link>
		</StyledLayoutBlock>
	);
};
