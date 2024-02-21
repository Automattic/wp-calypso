import { useTranslate } from 'i18n-calypso';
import Main from 'calypso/components/main';

import './style.scss';

export default () => {
	const translate = useTranslate();

	return (
		<Main isLoggedOut fullWidthLayout>
			<h1>Build your perfect site with patterns</h1>

			<p>{ translate( 'Trending' ) }</p>
		</Main>
	);
};
