import React from 'react';

import Gridicon from 'components/gridicon';
import SocialLogo from 'components/social-logo';

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
		icon: 'add-image',
		item: <GridiconButton icon="image-multiple" label={ 'Add Media' } />,
		cmd: 'wpcomAddMedia'
	},
	{
		name: 'insert_contact_form',
		icon: 'mention',
		item: <GridiconButton icon="mention" label={ 'Add Contact Form' } />,
		cmd: 'wpcomContactForm'
	}
];
