/* global wpcomGlobalStyles */

import { Button, Notice } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import './notice.scss';

const GlobalStylesNotice = () => {
	const { editEntityRecord } = useDispatch( 'core' );
	const globalStylesId = useSelect(
		( select ) => select( 'core' ).__experimentalGetCurrentGlobalStylesId(),
		[]
	);
	const resetGlobalStyles = () => {
		editEntityRecord( 'root', 'globalStyles', globalStylesId, {
			styles: {},
			settings: {},
		} );
	};
	return (
		<Notice status="warning" isDismissible={ false } className="wpcom-global-styles-notice">
			{ createInterpolateElement(
				__(
					"Your style changes won't be public until you <upgradeLink>upgrade your plan</upgradeLink>. You can <revertLink>revert your styles</revertLink>.",
					'full-site-editing'
				),
				{
					upgradeLink: (
						<Button variant="link" href={ wpcomGlobalStyles.upgradeUrl } target="_top" />
					),
					revertLink: <Button variant="link" onClick={ resetGlobalStyles } />,
				}
			) }
		</Notice>
	);
};

export default GlobalStylesNotice;
