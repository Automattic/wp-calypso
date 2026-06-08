/**
 * Floating "Refine with AI" launcher pinned to the bottom-inline-end corner
 * of the output-detail screen. Opens the dock with an empty input; the caller
 * hides it while the dock is open. Per-page editing is handled separately.
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { starFilled } from '@wordpress/icons';

import './refine-launcher.scss';

interface Props {
	onClick: () => void;
}

export default function RefineLauncher( { onClick }: Props ) {
	return (
		<Button
			className="a4a-refine-launcher"
			variant="primary"
			icon={ starFilled }
			iconSize={ 24 }
			label={ __( 'Refine with AI' ) }
			showTooltip
			onClick={ onClick }
		/>
	);
}
