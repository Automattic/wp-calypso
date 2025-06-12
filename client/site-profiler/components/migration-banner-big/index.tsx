import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import WPCOMLogo from 'calypso/assets/images/a8c-for-agencies/wpcom-logo.svg';
import siteProfilerBackground from 'calypso/assets/images/site-profiler/background-results-good.svg';
import { LayoutBlock } from 'calypso/site-profiler/components/layout';

const StyledLayoutBlock = styled( LayoutBlock )`
	position: relative;
	z-index: 0;
	&:before {
		content: '';
		position: absolute;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		background: url( ${ siteProfilerBackground } ) no-repeat right top;
		transform: scaleY( -1 );
		z-index: -1;
	}

	&.l-block {
		padding-bottom: 200px;
	}
`;
const StyledWPCOMLogo = styled.img`
	margin-bottom: 30px;
	filter: brightness( 0 ) saturate( 100% ) invert( 56% ) sepia( 96% ) saturate( 6609% )
		hue-rotate( 225deg ) brightness( 95% ) contrast( 93% );
`;
const Heading = styled.div`
	font-size: 60px;
	line-height: 50px;
	margin-bottom: 15px;
`;
const Description = styled.div`
	margin-bottom: 60px;
	color: var( --studio-gray-20 );
	font-size: 16px;
`;
const StyledButton = styled( Button )`
	background-color: var( --color-button );
	border: none;
	color: #fff;
	padding: 10px 24px;

	&:hover {
		color: #fff;
		background-color: var( --color-button-60 );
	}
`;

const onMigrateSite = ( url?: string ) => {
	recordTracksEvent( 'calypso_site_profiler_cta', {
		cta_name: 'migrateSiteBannerBig',
		url,
	} );
	page( `/setup/site-migration?ref=site-profiler&from=${ url }` );
};

export const MigrationBannerBig = ( { url }: { url?: string } ) => {
	const translate = useTranslate();

	return (
		<StyledLayoutBlock width="medium">
			<StyledWPCOMLogo src={ WPCOMLogo } />
			<Heading>{ translate( 'Boost your site performance' ) }</Heading>
			<Description>
				{ translate(
					"Experience top-tier speed and reliability on WordPress.com.{{br/}}It's time to give your site the platform it deserves.",
					{
						components: {
							br: <br />,
						},
					}
				) }
			</Description>
			<StyledButton onClick={ () => onMigrateSite( url ) }>
				{ translate( 'Start your free migration' ) }
			</StyledButton>
		</StyledLayoutBlock>
	);
};
