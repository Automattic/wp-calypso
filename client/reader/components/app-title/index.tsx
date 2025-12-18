import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import './index.scss';

interface props {
	className?: string;
}
const AppTitle = ( { className }: props ) => {
	const translate = useTranslate();
	return (
		<Button
			href="/reader"
			aria-label={ translate( 'Reader' ) }
			className={ clsx( 'app-title', className ) }
		>
			<h3 className="app-title__heading">{ translate( 'Reader' ) }</h3>
		</Button>
	);
};

export default AppTitle;
