/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { getDocumentHeadTitle } from 'state/document-head/selectors';
import getCurrentRoute from 'state/selectors/get-current-route';
import Item from 'layout/masterbar/item';
import JetpackLogo from 'components/jetpack-logo';
import Masterbar from 'layout/masterbar/masterbar';
import ProfileDropdown from 'landing/jetpack-cloud/components/profile-dropdown';
import { useBreakpoint } from '@automattic/viewport-react';
/**
 * Style dependencies
 */
import './style.scss';

const useOpenClose = () => {
	const [ isOpen, setIsOpen ] = React.useState( false );
	const close = React.useCallback( () => {
		setIsOpen( false );
	}, [ setIsOpen ] );
	const toggle = React.useCallback( () => {
		setIsOpen( ! isOpen );
	}, [ isOpen, setIsOpen ] );
	return { isOpen, close, toggle };
};

const JetpackCloudMasterBar = () => {
	const translate = useTranslate();
	const headerTitle = useSelector( getDocumentHeadTitle );
	const currentRoute = useSelector( getCurrentRoute );
	const isNarrow = useBreakpoint( '<660px' );
	const isExteriorPage = /^\/(?:backup|scan)\/[^/]*$/.test( currentRoute );
	const { isOpen, close, toggle } = useOpenClose();
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
				<JetpackLogo size={ 28 } full={ ! isNarrow || isExteriorPage } />
			</Item>
			<Item className="masterbar__item-title">{ headerTitle }</Item>
			<Item
				tipTarget="me"
				url="#" // @todo: add a correct URL
				onClick={ toggle }
				icon="user-circle"
				className={ classnames( 'masterbar__item-me', {
					'masterbar__item-me--open': isOpen,
				} ) }
				tooltip={ translate( 'Log out of Jetpack Cloud' ) }
			>
				<ProfileDropdown isOpen={ isOpen } close={ close } />
			</Item>
		</Masterbar>
	);
};

export default JetpackCloudMasterBar;
