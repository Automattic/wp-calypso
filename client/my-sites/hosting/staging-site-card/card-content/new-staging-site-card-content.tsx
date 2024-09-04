import config from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useHasEnTranslation } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { HostingCardDescription } from 'calypso/components/hosting-card';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { ExceedQuotaErrorContent } from './exceed-quota-error-content';

type CardContentProps = {
	onAddClick: () => void;
	isButtonDisabled: boolean;
	showQuotaError: boolean;
	isDevelopmentSite?: boolean;
};

export const NewStagingSiteCardContent = ( {
	onAddClick,
	isButtonDisabled,
	showQuotaError,
	isDevelopmentSite,
}: CardContentProps ) => {
	{
		const translate = useTranslate();
		const hasEnTranslation = useHasEnTranslation();
		const stagingSiteSyncWoo = config.isEnabled( 'staging-site-sync-woo' );

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
				{ stagingSiteSyncWoo && (
					<div>
						<p>{ translate( 'WooCommerce Site' ) }</p>
						<p>
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
						</p>
					</div>
				) }
				{ isDevelopmentSite && (
					// Not wrapped in translation to avoid request unconfirmed copy
					<p>The staging feature will be available once the site is launched.</p>
				) }
				<Button disabled={ isButtonDisabled } onClick={ onAddClick }>
					<span>{ translate( 'Add staging site' ) }</span>
				</Button>
				{ showQuotaError && <ExceedQuotaErrorContent /> }
			</>
		);
	}
};
