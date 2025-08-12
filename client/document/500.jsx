import config from '@automattic/calypso-config';
import clsx from 'clsx';
import EmptyContent from 'calypso/components/empty-content';
import Head from 'calypso/components/head';
import { chunkCssLinks } from './utils';

function ServerError( { entrypoint } ) {
	const theme = config( 'theme' );

	return (
		<html lang="en">
			<Head>{ chunkCssLinks( entrypoint ) }</Head>
			<body
				className={ clsx( {
					[ 'theme-' + theme ]: theme,
				} ) }
			>
				{ /* eslint-disable wpcalypso/jsx-classname-namespace*/ }
				<div id="wpcom" className="wpcom-site">
					<div className="wp has-no-sidebar">
						<div className="layout__content" id="content">
							<div className="layout__primary" id="primary">
								<EmptyContent title="We're sorry, but an unexpected error has occurred" />
							</div>
						</div>
					</div>
				</div>
				{ /* eslint-enable wpcalypso/jsx-classname-namespace*/ }
			</body>
		</html>
	);
}

export default ServerError;
