import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { Notice as WPNotice } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Notice from 'calypso/components/notice';
import { useSelector } from 'calypso/state';
import isSiteStore from 'calypso/state/selectors/is-site-store';
import { ExceedQuotaErrorContent } from './exceed-quota-error-content';

const WarningTitle = styled.p( {
	fontWeight: 600,
	marginBottom: '8px',
} );

const NoticeWrapper = styled.div( {
	marginBottom: '16px',
} );

type CardContentProps = {
	siteId: number;
	onAddClick: () => void;
	isButtonDisabled: boolean;
	showQuotaError: boolean;
	isDevelopmentSite?: boolean;
	disabledMessage?: string;
};

export const NewStagingSiteCardContent = ( {
	siteId,
	onAddClick,
	isButtonDisabled,
	showQuotaError,
	isDevelopmentSite,
	disabledMessage,
}: CardContentProps ) => {
	const translate = useTranslate();
	const isSiteWooStore = !! useSelector( ( state ) => isSiteStore( state, siteId ) );

	return (
		<>
			{ isSiteWooStore && (
				<NoticeWrapper>
					<WPNotice status="warning" isDismissible={ false }>
						<WarningTitle>
							{ translate( 'Syncing WooCommerce sites can overwrite orders' ) }
						</WarningTitle>
						{ translate(
							'Syncing the staging database to production will overwrite orders, products, pages and posts. {{a}}Learn more{{/a}}',
							{
								components: {
									a: (
										<InlineSupportLink
											supportContext="staging-to-production-sync"
											showIcon={ false }
										/>
									),
								},
							}
						) }
					</WPNotice>
				</NoticeWrapper>
			) }
			{ isDevelopmentSite && (
				<p>{ translate( 'Staging sites are only available to sites launched in production.' ) }</p>
			) }
			{ isButtonDisabled && disabledMessage && (
				<Notice status="is-error" showDismiss={ false }>
					{ disabledMessage }
				</Notice>
			) }
			<Button primary disabled={ isButtonDisabled } onClick={ onAddClick }>
				<span>{ translate( 'Add staging site' ) }</span>
			</Button>
			{ showQuotaError && <ExceedQuotaErrorContent /> }
		</>
	);
};
