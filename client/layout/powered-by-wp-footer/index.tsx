import { WordPressLogo } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

interface Props {
	clientTitle?: string;
}

export default function PoweredByWPFooter( { clientTitle }: Props ) {
	const translate = useTranslate();

	function renderPoweredByWP() {
		return (
			<>
				<WordPressLogo size={ 20 } className="powered-by-wp-footer__logo" />
				<span>{ translate( 'Powered by WordPress.com' ) }</span>
			</>
		);
	}

	function renderPoweredByWPWithClientTitle( title: string ) {
		const wording = translate( '%(title)s is powered by <logo/> WordPress.com', {
			args: { title },
			comment:
				"'clientTitle' is the name of the app that uses WordPress.com Connect (e.g. 'Crowdsignal' or 'Gravatar')",
		} ) as string;

		return createInterpolateElement( wording, {
			logo: <WordPressLogo size={ 20 } className="powered-by-wp-footer__logo" />,
		} );
	}

	return (
		<footer className="powered-by-wp-footer">
			<div className="powered-by-wp-footer__info">
				{ clientTitle ? renderPoweredByWPWithClientTitle( clientTitle ) : renderPoweredByWP() }
			</div>
		</footer>
	);
}
