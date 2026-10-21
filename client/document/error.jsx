import { isLocaleRtl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import EmptyContent from 'calypso/components/empty-content';
import Head from 'calypso/components/head';
import { chunkCssLinks } from './utils';

export default function ErrorPage( { entrypoint, preset, lang, faviconUrl } ) {
	const isRTL = isLocaleRtl( lang );

	return (
		<html lang={ lang } dir={ isRTL ? 'rtl' : 'ltr' }>
			<Head
				title={ preset.title }
				faviconBrand="a4a"
				faviconUrl={ faviconUrl }
				allowZoom
				shouldPrefetchRestProxy={ false }
			>
				{ chunkCssLinks( entrypoint, isRTL ) }
			</Head>
			<body
				className={ clsx( 'a4a-error-document theme-a8c-for-agencies accessible-focus', {
					rtl: isRTL,
				} ) }
			>
				{ /* eslint-disable wpcalypso/jsx-classname-namespace */ }
				<div id="wpcom" className="wpcom-site">
					<div className="layout has-no-sidebar has-no-masterbar">
						<main className="layout__content" id="content">
							<div className="layout__primary" id="primary">
								<EmptyContent
									className="a4a-error-page"
									title={ preset.title }
									line={ preset.subtitle }
									action={ preset.buttonText }
									actionURL={ preset.buttonUrl }
								/>
							</div>
						</main>
					</div>
				</div>
				{ /* eslint-enable wpcalypso/jsx-classname-namespace */ }
			</body>
		</html>
	);
}
