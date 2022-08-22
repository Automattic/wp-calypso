import { useBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import JetpackLogo from 'calypso/components/jetpack-logo';
import ProfileDropdown from 'calypso/components/jetpack/profile-dropdown';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { getDocumentHeadTitle } from 'calypso/state/document-head/selectors/get-document-head-title';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { setLayoutFocus } from 'calypso/state/ui/layout-focus/actions';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';

import './style.scss';

const JetpackCloudMasterBar: React.FC = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const headerTitle = useSelector( getDocumentHeadTitle );
	const currentRoute = useSelector( getCurrentRoute );
	const isNarrow = useBreakpoint( '<660px' );
	const currentLayoutFocus = useSelector( getCurrentLayoutFocus );
	const isExteriorPage = /^\/(?:backup|scan)\/[^/]*$/.test( currentRoute );

	const handleLogoClick = React.useCallback(
		( e ) => {
			if ( isNarrow && 'sidebar' === currentLayoutFocus ) {
				e.preventDefault();
				dispatch( setLayoutFocus( 'content' ) );
			}
		},
		[ dispatch, setLayoutFocus, isNarrow, currentLayoutFocus ]
	);

	return (
		<Masterbar
			className="is-jetpack-cloud-masterbar" // eslint-disable-line wpcalypso/jsx-classname-namespace
		>
			<a
				className="masterbar__item-home"
				href="/"
				onClick={ handleLogoClick }
				title={
					translate( 'Jetpack Cloud Dashboard', {
						comment: 'Jetpack Cloud top navigation bar item',
					} ) as string
				}
			>
				<JetpackLogo size={ 28 } full={ ! isNarrow || isExteriorPage } aria={ { hidden: true } } />
			</a>
			<AsyncLoad require="calypso/components/jetpack/portal-nav" placeholder={ null } />
			{ headerTitle && <h1 className="masterbar__item-title">{ headerTitle }</h1> }
			<ProfileDropdown />
		</Masterbar>
	);
};

export default JetpackCloudMasterBar;
