import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import siteProfilerBackground from 'calypso/assets/images/site-profiler/background-results-good.svg';
import { LayoutBlock } from 'calypso/site-profiler/components/layout';

const StyledLayoutBlock = styled( LayoutBlock )`
	position: relative;
	overflow: hidden;
	z-index: 0;
	&:before {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		background: url( ${ siteProfilerBackground } ) no-repeat right bottom;
		transform: scaleY( -1 );
		z-index: -1;
	}
`;

const Heading = styled.h1`
	&#migration-banner-heading {
		font-size: 60px;
	}
`;
const Description = styled.div`
	margin-bottom: 60px;
	color: var( --studio-gray-20 );
	font-size: 16px;
`;

const StyledButton = styled( Button )`
	&.migration-banner-button {
		padding: 10px 24px;
	}
`;

const onMigrateSite = () => {
	recordTracksEvent( 'calypso_site_profiler_cta', {
		cta_name: 'migrateSiteBannerBig',
	} );
	page( `/setup/hosted-site-migration?ref=site-profiler` );
};

export const MigrationBannerBig = () => {
	const translate = useTranslate();

	return (
		<StyledLayoutBlock width="medium">
			<Heading id="migration-banner-heading">
				{ translate( 'Boost your site performance' ) }
			</Heading>
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
			<StyledButton className="migration-banner-button button-action" onClick={ onMigrateSite }>
				{ translate( 'Start your free migration' ) }
			</StyledButton>
		</StyledLayoutBlock>
	);
};
