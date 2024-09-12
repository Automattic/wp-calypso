import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import { HostingCardDescription } from 'calypso/components/hosting-card';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
import isSiteStore from 'calypso/state/selectors/is-site-store';
import { ExceedQuotaErrorContent } from './exceed-quota-error-content';

const WarningContainer = styled.div( {
	marginTop: '16px',
	padding: '16px',
	marginBottom: '24px',
	border: '1px solid #f0c930',
	borderRadius: '4px',
} );

const WarningTitle = styled.p( {
	fontWeight: 500,
	marginBottom: '8px',
} );

const WarningDescription = styled.p( {
	marginBottom: '8px',
} );

type CardContentProps = {
	siteId: number;
	onAddClick: () => void;
	isButtonDisabled: boolean;
	showQuotaError: boolean;
	isDevelopmentSite?: boolean;
};

export const NewStagingSiteCardContent = ( {
	siteId,
	onAddClick,
	isButtonDisabled,
	showQuotaError,
	isDevelopmentSite,
}: CardContentProps ) => {
	{
		const translate = useTranslate();
		const hasEnTranslation = useHasEnTranslation();
		const stagingSiteSyncWoo = config.isEnabled( 'staging-site-sync-woo' );
		const isSiteWooStore = !! useSelector( ( state ) => isSiteStore( state, siteId ) );

		return (
			<>
				<HostingCardDescription>
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
								'A staging site is a test version of your website you can use to preview and troubleshoot changes before applying them to your production site. {{a}}Learn more{{/a}}.',
								{
									components: {
										a: (
											<InlineSupportLink supportContext="hosting-staging-site" showIcon={ false } />
										),
									},
								}
						  ) }
				</HostingCardDescription>
				{ stagingSiteSyncWoo && isSiteWooStore && (
					<WarningContainer>
						<WarningTitle>{ translate( 'WooCommerce Site' ) }</WarningTitle>
						<WarningDescription>
							{ translate(
								'Syncing staging database to production overwrites posts, pages, products and orders. {{a}}Learn more{{/a}}.',
								{
									components: {
										a: (
											<InlineSupportLink supportContext="hosting-staging-site" showIcon={ false } />
										),
									},
								}
							) }
						</WarningDescription>
					</WarningContainer>
				) }
				{ isDevelopmentSite && (
					// Not wrapped in translation to avoid request unconfirmed copy
					<p>The staging feature will be available once the site is launched.</p>
				) }
				<Button primary disabled={ isButtonDisabled } onClick={ onAddClick }>
					<span>{ translate( 'Add staging site' ) }</span>
				</Button>
				{ showQuotaError && <ExceedQuotaErrorContent /> }
			</>
		);
	}
};
