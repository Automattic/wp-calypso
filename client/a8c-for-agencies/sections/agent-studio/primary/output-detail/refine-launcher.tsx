/**
 * Floating "Refine with AI" launcher for the output-detail screen.
 *
 * The refine entry point used to be a button in the action bar, which
 * scrolled away with the deck. This pins a persistent circular icon to the
 * bottom-inline-end corner so refining is always one click away no matter
 * how far down the preview the user has scrolled. Clicking it opens the
 * dock with an empty input; per-page editing is handled separately by the
 * icon buttons revealed on each page.
 *
 * The launcher hides while the dock is open (the dock owns the 400px right
 * rail and its own close control), so the button never sits underneath it.
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
