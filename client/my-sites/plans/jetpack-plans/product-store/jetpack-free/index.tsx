import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import useJetpackFreeButtonProps from '../../jetpack-free-card/use-jetpack-free-button-props';
import { JetpackFreeProps } from '../types';

import './style.scss';

export const JetpackFree: React.FC< JetpackFreeProps > = ( { urlQueryArgs, siteId } ) => {
	const translate = useTranslate();

	const { href, onClick } = useJetpackFreeButtonProps( siteId, urlQueryArgs );

	return (
		<div className="jetpack-product-store__jetpack-free">
			<h3 className="jetpack-product-store__jetpack-free--headline">
				{ translate( 'Still not sure?' ) }
			</h3>
			<p className="jetpack-product-store__jetpack-free--info">
				{ translate( 'Start with the free version and try out our premium products later.' ) }
			</p>
			<Button onClick={ onClick } href={ href }>
				{ translate( 'Start with %(productName)s', {
					args: {
						productName: translate( 'Jetpack Free' ),
					},
				} ) }
			</Button>
		</div>
	);
};
