import { Button, MaterialIcon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

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
