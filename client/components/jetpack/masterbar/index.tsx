/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getDocumentHeadTitle } from 'calypso/state/document-head/selectors/get-document-head-title';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { useSelector } from 'react-redux';
import Item from 'calypso/layout/masterbar/item';
import JetpackLogo from 'calypso/components/jetpack-logo';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import ProfileDropdown from 'calypso/components/jetpack/profile-dropdown';
import { useBreakpoint } from '@automattic/viewport-react';
import AsyncLoad from 'calypso/components/async-load';

/**
 * Style dependencies
 */
import './style.scss';

const JetpackCloudMasterBar: React.FC = () => {
	const translate = useTranslate();
	const headerTitle = useSelector( getDocumentHeadTitle );
	const currentRoute = useSelector( getCurrentRoute );
	const isNarrow = useBreakpoint( '<660px' );
	const isExteriorPage = /^\/(?:backup|scan)\/[^/]*$/.test( currentRoute );

	return (
		<Masterbar
			className="is-jetpack-cloud-masterbar" // eslint-disable-line wpcalypso/jsx-classname-namespace
		>
			<Item
				className="masterbar__item-home"
				url="/"
				tooltip={ translate( 'Jetpack Cloud Dashboard', {
					comment: 'Jetpack Cloud top navigation bar item',
				} ) }
			>
				<JetpackLogo size={ 28 } full={ ! isNarrow || isExteriorPage } aria={ { hidden: true } } />
			</Item>
			<AsyncLoad require="calypso/components/jetpack/portal-nav" placeholder={ null } />
			{ headerTitle && <h1 className="masterbar__item-title">{ headerTitle }</h1> }
			<ProfileDropdown />
		</Masterbar>
	);
};

export default JetpackCloudMasterBar;
