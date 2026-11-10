import { Domain } from '@automattic/api-core';
import { siteByIdQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import RouterLinkSummaryButton from '../../components/router-link-summary-button';
import SiteIcon from '../../components/site-icon';
import SummaryButton from '../../components/summary-button';
import { Text } from '../../components/text';
import { getSiteDisplayName } from '../../utils/site-name';
import './site-summary.scss';

export default function DomainSiteSettingsSummary( {
	domain,
	onClick,
}: {
	domain: Domain;
	onClick?: () => void;
} ) {
	const { data: site } = useQuery( siteByIdQuery( domain.blog_id ) );

	const shouldShowAttachSite =
		domain.is_domain_only_site &&
		! domain.is_gravatar_restricted_domain &&
		domain.can_transfer_to_other_site;

	if ( shouldShowAttachSite ) {
		return (
			<RouterLinkSummaryButton
				to={ `/domains/${ domain.domain }/transfer/other-site` }
				title={ __( 'Site' ) }
				badges={ [ { text: __( 'No site attached' ) } ] }
				density="medium"
				onClick={ onClick }
			/>
		);
	}

	// Not a link: the site already leads to this page, so linking back would be circular.
	return (
		<SummaryButton
			className="dashboard-summary-button domain-overview-site-summary"
			title={ __( 'Site' ) }
			suffix={
				site ? (
					<HStack as="span" spacing={ 2 } expanded={ false }>
						<SiteIcon site={ site } size={ 24 } />
						<Text variant="muted">{ getSiteDisplayName( site ) }</Text>
					</HStack>
				) : undefined
			}
			showArrow={ false }
			disabled
			density="medium"
		/>
	);
}
