/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';
import JetpackHeader from 'components/jetpack-header';
import DocumentHead from 'components/data/document-head';
import getPartnerSlugFromQuery from 'state/selectors/get-partner-slug-from-query';
import getCurrentRoute from 'state/selectors/get-current-route';

import './style.scss';

function StoreHeader() {
	const translate = useTranslate();
	const partnerSlug = useSelector( ( state ) => getPartnerSlugFromQuery( state ) );
	const currentRoute = useSelector( ( state ) => getCurrentRoute( state ) );
	const isStoreLanding = currentRoute === '/jetpack/connect/store';

	const headerClass = classNames( 'jetpack-connect__main-logo', {
		'add-bottom-margin': ! isStoreLanding,
	} );
	return (
		<>
			<DocumentHead title={ translate( 'Jetpack Connect' ) } />
			<div className={ headerClass }>
				<JetpackHeader
					partnerSlug={ partnerSlug }
					isWoo={ false }
					isWooDna={ false }
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

export default StoreHeader;
