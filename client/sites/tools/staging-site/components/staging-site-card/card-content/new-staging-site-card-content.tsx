import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
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
		const isSiteWooStore = !! useSelector( ( state ) => isSiteStore( state, siteId ) );

		return (
			<>
				{ isSiteWooStore && (
					<WarningContainer>
						<WarningTitle>{ translate( 'WooCommerce Site' ) }</WarningTitle>
						<WarningDescription>
							{ translate(
								'Syncing staging database to production overwrites posts, pages, products and orders. {{a}}Learn more{{/a}}.',
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
						</WarningDescription>
					</WarningContainer>
				) }
				{ isDevelopmentSite && (
					<p>
						{ translate( 'Staging sites are only available to sites launched in production.' ) }
					</p>
				) }
				<Button primary disabled={ isButtonDisabled } onClick={ onAddClick }>
					<span>{ translate( 'Add staging site' ) }</span>
				</Button>
				{ showQuotaError && <ExceedQuotaErrorContent /> }
			</>
		);
	}
};
