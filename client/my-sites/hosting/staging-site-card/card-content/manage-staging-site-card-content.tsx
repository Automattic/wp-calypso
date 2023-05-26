import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import SiteIcon from 'calypso/blocks/site-icon';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { urlToSlug } from 'calypso/lib/url';
import { DeleteStagingSite } from 'calypso/my-sites/hosting/staging-site-card/delete-staging-site';
import { StagingSite } from 'calypso/my-sites/hosting/staging-site-card/use-staging-site';
import SitesStagingBadge from 'calypso/sites-dashboard/components/sites-staging-badge';

const SiteRow = styled.div( {
	display: 'flex',
	alignItems: 'center',
	marginBottom: 24,
	'.site-icon': { flexShrink: 0 },
} );

const SiteInfo = styled.div( {
	display: 'flex',
	flexDirection: 'column',
	marginLeft: 10,
} );

const SiteNameContainer = styled.div( {
	display: 'block',
} );

const SiteName = styled.a( {
	fontWeight: 500,
	marginInlineEnd: '8px',
	'&:hover': {
		textDecoration: 'underline',
	},
	'&, &:hover, &:visited': {
		color: 'var( --studio-gray-100 )',
	},
} );

const StagingSiteLink = styled.div( {
	wordBreak: 'break-word',
} );

const ActionButtons = styled.div( {
	display: 'flex',
	gap: '1em',

	'@media screen and (max-width: 768px)': {
		gap: '0.5em',
		flexDirection: 'column',
		'.button': { flexGrow: 1 },
	},
} );

type CardContentProps = {
	stagingSite: StagingSite;
	onDeleteClick: () => void;
	isButtonDisabled: boolean;
	isBusy: boolean;
};

export const ManageStagingSiteCardContent = ( {
	stagingSite,
	onDeleteClick,
	isButtonDisabled,
	isBusy,
}: CardContentProps ) => {
	{
		const translate = useTranslate();
		return (
			<>
				<p>
					{ translate(
						'Your staging site lets you preview and troubleshoot changes before updating the production site. {{a}}Learn more{{/a}}.',
						{
							components: {
								a: <InlineSupportLink supportContext="hosting-staging-site" showIcon={ false } />,
							},
						}
					) }
				</p>
				<SiteRow>
					<SiteIcon siteId={ stagingSite.id } size={ 40 } />
					<SiteInfo>
						<SiteNameContainer>
							<SiteName
								href={ `/hosting-config/${ urlToSlug( stagingSite.url ) }` }
								title={ translate( 'Visit Dashboard' ) }
							>
								{ stagingSite.name }
							</SiteName>
							<SitesStagingBadge>{ translate( 'Staging' ) }</SitesStagingBadge>
						</SiteNameContainer>
						<StagingSiteLink>
							<a href={ stagingSite.url }>{ stagingSite.url }</a>
						</StagingSiteLink>
					</SiteInfo>
				</SiteRow>
				<ActionButtons>
					<Button
						primary
						href={ `/hosting-config/${ urlToSlug( stagingSite.url ) }` }
						disabled={ isButtonDisabled }
					>
						<span>{ translate( 'Manage staging site' ) }</span>
					</Button>
					<DeleteStagingSite
						disabled={ isButtonDisabled }
						onClickDelete={ onDeleteClick }
						isBusy={ isBusy }
					>
						<Gridicon icon="trash" />
						<span>{ translate( 'Delete staging site' ) }</span>
					</DeleteStagingSite>
				</ActionButtons>
			</>
		);
	}
};
