import { Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SiteRenewProps {
	site: SiteExcerptData;
}

const SiteRenewContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

const SiteRenewLink = styled.a( {
	whiteSpace: 'nowrap',
	textDecoration: 'underline',
} );

const SiteRenewNotice = styled.div`
	display: flex;
	align-items: center;
	color: #ea303f;
	margin-top: -6px;
`;

export const SiteRenew = ( { site }: SiteRenewProps ) => {
	const { __ } = useI18n();
	const isSiteOwner = site.plan?.user_is_owner;
	const renewText = __( 'Renew' );
	return (
		<SiteRenewContainer>
			<SiteRenewNotice>
				<Gridicon icon="notice" />
				{ `${ site.plan?.product_name_short } - Expired` }
			</SiteRenewNotice>
			{ isSiteOwner && (
				<SiteRenewLink href={ `/checkout/${ site.slug }` } title={ renewText }>
					{ renewText }
				</SiteRenewLink>
			) }
		</SiteRenewContainer>
	);
};
