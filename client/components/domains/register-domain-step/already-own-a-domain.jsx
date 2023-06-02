import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import MaterialIcon from 'calypso/components/material-icon';

function AlreadyOwnADomain( { onClick } ) {
	const translate = useTranslate();
	return (
		<div className="already-own-a-domain">
			<MaterialIcon icon="info" />
			<span>
				{ translate(
					'Already own a domain? You can {{action}}use it as your site’s address{{/action}}',
					{
						components: {
							action: <Button plain href="#" onClick={ onClick } />,
						},
					}
				) }
			</span>
		</div>
	);
}

export default AlreadyOwnADomain;
