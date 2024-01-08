import page from '@automattic/calypso-router';
import MasterbarStyled from './masterbar-styled';

export type CheckoutMasterbarProps = {
	siteId?: number | null;
	siteSlug?: string | null;
	backText?: string;
};

const CheckoutMasterbar = ( { siteId, siteSlug, backText }: CheckoutMasterbarProps ) => {
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
			<MasterbarStyled
				onClick={ () => page( `/home/${ siteSlug ?? '' }` ) }
				backText={ backText ?? '' }
				canGoBack={ true }
				showContact={ true }
			/>
		</>
	);
};

export default CheckoutMasterbar;
