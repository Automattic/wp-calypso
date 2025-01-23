import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackHeader from 'calypso/components/jetpack-header';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getPartnerSlugFromQuery from 'calypso/state/selectors/get-partner-slug-from-query';

import './style.scss';

export default function StoreHeader() {
	const translate = useTranslate();
	const partnerSlug = useSelector( getPartnerSlugFromQuery );
	const currentRoute = useSelector( getCurrentRoute );

	const isStoreLanding =
		currentRoute === '/jetpack/connect/store' ||
		currentRoute.match( new RegExp( '^/jetpack/connect/plans/[^/]+/?(monthly|annual)?$' ) );

	const headerClass = clsx( 'jetpack-connect__main-logo', {
		'add-bottom-margin': ! isStoreLanding,
	} );

	return (
		<>
			<DocumentHead title={ translate( 'Jetpack Connect' ) } />
			<div className={ headerClass }>
				<JetpackHeader
					partnerSlug={ partnerSlug }
					isWooOnboarding={ false }
					isWooDna={ false }
					isWooJPC={ false }
					darkColorScheme
				/>
			</div>
			{ isStoreLanding && (
				<FormattedHeader
					headerText={ translate( 'Explore our Jetpack plans' ) }
					subHeaderText={ translate( 'Pick a plan that fits your needs.' ) }
					brandFont
				/>
			) }
		</>
	);
}
