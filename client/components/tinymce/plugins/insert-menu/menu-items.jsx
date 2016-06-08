import React from 'react';

import Gridicon from 'components/gridicon';
import SocialLogo from 'components/social-logo';
import i18n from 'i18n-calypso';

const GridiconButton = ( { icon, label } ) => (
	<div>
		<Gridicon className="wpcom-insert-menu__menu-icon" icon={ icon } />
		<span className="wpcom-insert-menu__menu-label">{ label }</span>
	</div>
);

const SocialLogoButton = ( { icon, label } ) => (
	<div>
		<SocialLogo className="wpcom-insert-menu__menu-icon" icon={ icon } />
		<span className="wpcom-insert-menu__menu-label">{ label }</span>
	</div>
);

export default [
	{
		name: 'insert_media_item',
		item: <GridiconButton icon="add-image" label={ i18n.translate( 'Add Media' ) } />,
		cmd: 'wpcomAddMedia'
	},
	{
		name: 'insert_contact_form',
		item: <GridiconButton icon="mention" label={ i18n.translate( 'Add Contact Form' ) } />,
		cmd: 'wpcomContactForm'
	}
];
