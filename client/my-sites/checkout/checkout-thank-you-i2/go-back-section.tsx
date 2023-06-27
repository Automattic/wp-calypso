import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import MasterbarStyled from './masterbar/masterbar-styled';

export default function GoBackSection(): JSX.Element {
	return <DefaultGoBackSection />;
}

function DefaultGoBackSection() {
	const translate = useTranslate();
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<MasterbarStyled
			onClick={ () => page( `/home/${ siteSlug }` ) }
			backText={ translate( 'Back to home' ) }
			canGoBack={ true }
			showContact={ true }
		/>
	);
}
