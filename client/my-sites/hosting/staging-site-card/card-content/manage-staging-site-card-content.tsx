import { Button, Gridicon } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import SiteIcon from 'calypso/blocks/site-icon';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { navigate } from 'calypso/lib/navigate';
import { urlToSlug } from 'calypso/lib/url';
import { ConfirmationModal } from 'calypso/my-sites/hosting/staging-site-card/confirmation-modal';
import { StagingSite } from 'calypso/my-sites/hosting/staging-site-card/use-staging-site';
import SitesStagingBadge from 'calypso/sites-dashboard/components/sites-staging-badge';
import { useSelector } from 'calypso/state';
import getSiteUrl from 'calypso/state/selectors/get-site-url';
import { SiteSyncCard } from './staging-sync-card';

const SiteRow = styled.div( {
	display: 'flex',
	alignItems: 'center',
	marginBottom: 24,
	'.site-icon': { flexShrink: 0 },
} );

const BorderedContainer = styled.div( {
	display: 'flex',
	padding: '16px',
	flexDirection: 'column',
	alignItems: 'flex-start',
	alignSelf: 'stretch',
	borderRadius: '3px',
	border: '1px solid var(--gray-gray-5, #DCDCDE)',
	background: 'var(--White, #FFF)',
} );

const SyncActionsContainer = styled.div( {
	marginTop: 24,
	gap: '1em',
	display: 'flex',
	flexDirection: 'row',
	'@media screen and (max-width: 768px)': {
		gap: '0.5em',
		flexDirection: 'column',
		'.button': { flexGrow: 1 },
	},
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
		alignSelf: 'stretch',
	},
} );

type CardContentProps = {
	stagingSite: StagingSite;
	siteId: number;
	error?: string | null;
	onDeleteClick: () => void;
	onPushClick: () => void;
	onPullClick: () => void;
	isButtonDisabled: boolean;
	isBusy: boolean;
};

export const ManageStagingSiteCardContent = ( {
	stagingSite,
	siteId,
	onDeleteClick,
	onPushClick,
	onPullClick,
	error,
	isButtonDisabled,
	isBusy,
}: CardContentProps ) => {
	{
		const translate = useTranslate();
		const hasEnTranslation = useHasEnTranslation();
		const productionSiteUrl = useSelector( ( state ) => getSiteUrl( state, siteId ) );

		const ConfirmationDeleteButton = () => {
			return (
				<ConfirmationModal
					disabled={ isButtonDisabled }
					onConfirm={ onDeleteClick }
					isBusy={ isBusy }
					isScary
					modalTitle={ translate( 'Confirm staging site deletion' ) }
					modalMessage={ translate(
						'Are you sure you want to delete the staging site? This action cannot be undone.'
					) }
					confirmLabel={ translate( 'Delete staging site' ) }
					cancelLabel={ translate( 'Cancel' ) }
				>
					<Gridicon icon="trash" />
					<span>{ translate( 'Delete staging site' ) }</span>
				</ConfirmationModal>
			);
		};

		const ManageStagingSiteButton = () => {
			return (
				<Button
					onClick={ () => {
						navigate(
							`/overview/${ urlToSlug( stagingSite.url ) }?search=${ urlToSlug(
								productionSiteUrl as string
							) }`,
							false,
							true
						);
					} }
					disabled={ isButtonDisabled }
				>
					<span>{ translate( 'Manage staging site' ) }</span>
				</Button>
			);
		};
		return (
			<>
				<p>
					{ hasEnTranslation(
						'Preview and troubleshoot changes before updating your production site. {{a}}Learn more{{/a}}.'
					)
						? translate(
								'Preview and troubleshoot changes before updating your production site. {{a}}Learn more{{/a}}.',
								{
									components: {
										a: (
											<InlineSupportLink supportContext="hosting-staging-site" showIcon={ false } />
										),
									},
								}
						  )
						: translate(
								'Your staging site lets you preview and troubleshoot changes before updating the production site. {{a}}Learn more{{/a}}.',
								{
									components: {
										a: (
											<InlineSupportLink supportContext="hosting-staging-site" showIcon={ false } />
										),
									},
								}
						  ) }
				</p>
				<BorderedContainer>
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
						<ManageStagingSiteButton />
						<ConfirmationDeleteButton />
					</ActionButtons>
				</BorderedContainer>
				<SyncActionsContainer>
					<SiteSyncCard
						type="production"
						onPush={ onPushClick }
						onPull={ onPullClick }
						disabled={ isButtonDisabled }
						productionSiteId={ siteId }
						siteUrls={ {
							production: productionSiteUrl,
							staging: stagingSite.url,
						} }
						error={ error }
					/>
				</SyncActionsContainer>
			</>
		);
	}
};
