import { useTranslate } from 'i18n-calypso';
import React from 'react';
import MaterialIcon from 'calypso/components/material-icon';

function AlreadyOwnADomain( { onClick } ) {
	const translate = useTranslate();
	return (
		<div className="already-own-a-domain">
			<MaterialIcon icon="info" />
			{ translate(
				'Already own a domain? You can {{action}}use it as your site’s address{{/action}}',
				{
					components: {
						action: <button onClick={ onClick } />,
					},
				}
			) }
		</div>
	);
}

export default AlreadyOwnADomain;
