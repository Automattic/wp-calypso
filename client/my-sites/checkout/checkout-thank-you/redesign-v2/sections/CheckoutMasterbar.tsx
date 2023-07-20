import { useI18n } from '@wordpress/react-i18n';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import MasterbarStyled from '../masterbar-styled';

type HeaderProps = {
	siteId?: number;
	siteSlug: string | null;
	isBulkDomainTransfer: boolean;
};

const CheckoutMasterbar = ( { siteId, siteSlug, isBulkDomainTransfer }: HeaderProps ) => {
	const { __ } = useI18n();

	if ( isBulkDomainTransfer ) {
		return (
			<MasterbarStyled
				onClick={ () => {
					return;
				} }
				backText=""
				canGoBack={ false }
				showContact={ true }
			/>
		);
	}

	if ( siteId ) {
		return (
			<>
				<QuerySitePurchases siteId={ siteId } />
				<MasterbarStyled
					onClick={ () => page( `/home/${ siteSlug ?? '' }` ) }
					backText={ __( 'Back to dashboard' ) }
					canGoBack={ true }
					showContact={ true }
				/>
			</>
		);
	}

	return null;
};

export default CheckoutMasterbar;
