import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { getDashboardUrl, getSiteWpAdminUrl } from '../utils';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface Props {
	site: SiteExcerptData;
}

const SitesGridActionsWrapper = styled.div( {
	position: 'absolute',
	top: 0,
	bottom: 0,
	left: 0,
	right: 0,
	display: 'flex',
	justifyContent: 'center',
	backgroundColor: 'rgba( 255, 255, 255, 0.1 )',
	boxShadow: '0 7px 30px -10px rgba( 0, 0, 0, 0.2 )',
	opacity: 0,
	'&:hover': {
		opacity: 1,
	},
} );

const SitesGridActionsButtons = styled.div( {
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignContent: 'center',
	gap: '10px',
} );

export const SitesGridActions = ( { site }: Props ) => {
	const { __ } = useI18n();

	return (
		<SitesGridActionsWrapper>
			<SitesGridActionsButtons>
				<Button primary href={ getSiteWpAdminUrl( site ) }>
					{ __( 'WP Admin' ) }
				</Button>
				<Button href={ getDashboardUrl( site.slug ) }>{ __( 'Settings' ) }</Button>
			</SitesGridActionsButtons>
		</SitesGridActionsWrapper>
	);
};
