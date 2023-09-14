import { Button, Gridicon } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import SiteIcon from 'calypso/blocks/site-icon';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { urlToSlug } from 'calypso/lib/url';
import { ConfirmationModalButton } from 'calypso/my-sites/hosting/staging-site-card/confirm-modal-button';
import { StagingSite } from 'calypso/my-sites/hosting/staging-site-card/use-staging-site';
import SitesStagingBadge from 'calypso/sites-dashboard/components/sites-staging-badge';

const SiteRow = styled.div( {
	display: 'flex',
	alignItems: 'center',
	marginBottom: 24,
} );

const StagingDetailsContainer = styled.div( {
	display: 'flex',
	justifyContent: 'space-between',
	'.site-icon': { flexShrink: 0 },
	flexGrow: 1,
	'@media screen and (max-width: 768px)': {
		gap: '0.5em',
		flexDirection: 'column',
	},
} );

const StagingDetailsTitleContainer = styled.div( {
	display: 'flex',
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
					<StagingDetailsContainer>
						<StagingDetailsTitleContainer>
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
						</StagingDetailsTitleContainer>
						<div>
							<ConfirmationModalButton
								disabled={ isButtonDisabled }
								isCompact={ true }
								isPrimary={ true }
								onConfirm={ () => {
									// eslint-disable-next-line no-console
									console.log( 'Pull from staging site' );
								} }
								modalTitle={ translate( 'Confirm pulling from staging site' ) }
								modalMessage={ translate(
									'Are you sure you want to pull from your staging site to production? This action cannot be undone.'
								) }
								confirmLabel={ translate( 'Pull from staging' ) }
								cancelLabel={ translate( 'Cancel' ) }
							>
								<Gridicon icon="arrow-down" />
								<span>{ translate( 'Pull from staging' ) }</span>
							</ConfirmationModalButton>
						</div>
					</StagingDetailsContainer>
				</SiteRow>
				<ActionButtons>
					<Button
						primary
						href={ `/hosting-config/${ urlToSlug( stagingSite.url ) }` }
						disabled={ isButtonDisabled }
					>
						<span>{ translate( 'Manage staging site' ) }</span>
					</Button>
					<ConfirmationModalButton
						disabled={ isButtonDisabled }
						onConfirm={ onDeleteClick }
						isBusy={ isBusy }
						isScary={ true }
						modalTitle={ translate( 'Confirm staging site deletion' ) }
						modalMessage={ translate(
							'Are you sure you want to delete the staging site? This action cannot be undone.'
						) }
						confirmLabel={ translate( 'Delete staging site' ) }
						cancelLabel={ translate( 'Cancel' ) }
					>
						<Gridicon icon="trash" />
						<span>{ translate( 'Delete staging site' ) }</span>
					</ConfirmationModalButton>
				</ActionButtons>
			</>
		);
	}
};
