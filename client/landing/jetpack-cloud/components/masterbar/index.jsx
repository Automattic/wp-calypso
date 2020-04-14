/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import Item from 'layout/masterbar/item';
import JetpackLogo from 'components/jetpack-logo';
import Masterbar from 'layout/masterbar/masterbar';
import { getCurrentUser } from 'state/current-user/selectors';
import { getDocumentHeadTitle } from 'state/document-head/selectors';

/**
 * Style dependencies
 */
import './style.scss';

export default function () {
	const translate = useTranslate();
	const user = useSelector( state => getCurrentUser( state ) );
	const headerTitle = useSelector( state => getDocumentHeadTitle( state ) );
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
				<JetpackLogo size={ 28 } full />
			</Item>
			<Item className="masterbar__item-title">{ headerTitle }</Item>
			<Item
				tipTarget="me"
				url="#" // @todo: add a correct URL
				icon="user-circle"
				className="masterbar__item-me"
				tooltip={ translate( 'Update your profile, personal settings, and more' ) }
			>
				<Gravatar user={ user } alt={ translate( 'My Profile' ) } size={ 18 } />
				<span className="masterbar__item-me-label">
					{ translate( 'My Profile', { context: 'Toolbar, must be shorter than ~12 chars' } ) }
				</span>
			</Item>
		</Masterbar>
	);
}
