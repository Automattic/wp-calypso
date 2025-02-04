import { localizeUrl } from '@automattic/i18n-utils';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from 'calypso/lib/url';
import Circle from './circle';
import illustrationURL from './illustration.svg';
import Logo from './logo-wide';
import 'calypso/assets/stylesheets/style.scss';
import './style.scss';

const SUPPORTED_BROWSERS_LINK = localizeUrl(
	'https://wordpress.com/support/browser-issues/#supported-browsers'
);

export default function Browsehappy( { from } ) {
	// `from` is passed into the component via server-side-render. Since the query
	// param is sanitized and validated on the server, we can trust it here.
	const continueUrl = addQueryArgs( { bypassTargetRedirection: true }, from );

	return (
		<body className="browsehappy__body">
			<nav className="browsehappy__nav">
				<a href="https://wordpress.com" title={ __( 'WordPress.com' ) } rel="home">
					<Logo />
				</a>
			</nav>
			<main className="browsehappy__main" role="main">
				<img src={ illustrationURL } alt="" />
				<h1>{ __( 'Unsupported Browser' ) }</h1>
				<p>{ __( 'Unfortunately this page may not work correctly in your browser.' ) }</p>
				{ /* TODO: This mimics @wordpress/components button. Currently, wp components
				does not compile for SSR pages, but the style properties still exist. */ }
				{ /*eslint-disable-next-line wpcalypso/jsx-classname-namespace*/ }
				<a className="components-button is-primary" href={ SUPPORTED_BROWSERS_LINK }>
					{ __( 'View supported browsers' ) }
				</a>
				<p>
					<a className="browsehappy__anyway" href={ continueUrl }>
						{ __( 'Continue loading the page anyway' ) }
					</a>
				</p>
				<Circle color="yellow" position="1" />
				<Circle color="red" position="2" />
				<Circle color="gray" position="3" />
			</main>
		</body>
	);
}
