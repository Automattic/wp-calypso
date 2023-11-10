import page from '@automattic/calypso-router';
import { useI18n } from '@wordpress/react-i18n';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import MasterbarStyled from '../masterbar-styled';

type HeaderProps = {
	siteId?: number;
	siteSlug?: string | null;
};

const CheckoutMasterbar = ( { siteId, siteSlug }: HeaderProps ) => {
	const { __ } = useI18n();

	if ( ! siteId ) {
		return (
			<MasterbarStyled
				onClick={ () => page( `/home/${ siteSlug ?? '' }` ) }
				backText=""
				canGoBack={ false }
				showContact={ true }
			/>
		);
	}

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
};

export default CheckoutMasterbar;
