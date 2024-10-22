import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import type { HelpCenterSelect } from '@automattic/data-stores';

import './help-center-action-button.scss';

export const HelpCenterActionButton = () => {
	const translate = useTranslate();
	const { setShowHelpCenter } = useDispatch( 'automattic/help-center' );
	const { show } = useSelect( ( select ) => {
		const store: HelpCenterSelect = select( 'automattic/help-center' );
		return {
			show: store.isHelpCenterShown(),
		};
	}, [] );

	return (
		<div className="help-center-action-button">
			<span className="help-center-action-button__label">{ translate( 'Need extra help?' ) }</span>
			<Button
				variant="link"
				onClick={ () => {
					setShowHelpCenter( ! show );
				} }
			>
				{ translate( 'Visit Help Center' ) }
			</Button>
		</div>
	);
};
