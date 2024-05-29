import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { LayoutBlock } from 'calypso/site-profiler/components/layout';

const Heading = styled.h3``;
const Description = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 50px;
	justify-content: space-between;
	margin-bottom: 8px;
	color: var( --studio-gray-20 );
	font-size: 16px;
`;
const Link = styled.div`
	color: var( --color-button );
	text-decoration: none;
	&:hover {
		text-decoration: underline;
		color: var( --color-button );
		cursor: pointer;
	}
`;
const LinkIcon = styled( Gridicon )`
	transform: translate( 0, 3px );
	margin-left: 8px;
`;

const onMigrateSite = () => {
	recordTracksEvent( 'calypso_site_profiler_cta', {
		cta_name: 'migrateSiteBanner',
	} );
	page( `/setup/hosted-site-migration?ref=site-profiler` );
};

export const MigrationBanner = () => {
	const translate = useTranslate();

	return (
		<LayoutBlock width="medium">
			<Heading>{ translate( 'Want to see how much better your site could be? ' ) }</Heading>
			<Description>
				{ translate( 'Migrate for free and get access to our advanced performance tools.' ) }
				<Link onClick={ onMigrateSite }>
					{ translate( 'Bring your WordPress site to WordPress.com' ) }
					<LinkIcon icon="chevron-right" size={ 18 } />
				</Link>
			</Description>
		</LayoutBlock>
	);
};
