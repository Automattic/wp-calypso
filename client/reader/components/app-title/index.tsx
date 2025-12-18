import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import './index.scss';

const AppTitle = () => {
	const translate = useTranslate();
	return (
		<Button href="/reader" aria-label={ translate( 'Reader' ) } className="app-title">
			<h3 className="app-title__heading">{ translate( 'Reader' ) }</h3>
		</Button>
	);
};

export default AppTitle;
