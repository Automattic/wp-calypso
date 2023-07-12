import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

const Header: React.FC = () => {
	const translate = useTranslate();

	return (
		<FormattedHeader
			className="header__main-title"
			headerText={ preventWidows( translate( 'Compare Jetpack bundles' ) ) }
			subHeaderText={ translate( 'Choose the best bundle for your site' ) }
			align="center"
		/>
	);
};

export default Header;
