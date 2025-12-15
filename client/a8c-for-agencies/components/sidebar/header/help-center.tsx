import { HelpIcon } from '@automattic/help-center';
import { Button, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const SidebarHelpCenter = () => {
	const { toggleHelpCenter, show } = useHelpCenter();
	const dispatch = useDispatch();

	const handleOnClick = () => {
		dispatch( recordTracksEvent( 'calypso_a4a_sidebar_help_center_click' ) );
		toggleHelpCenter();
	};

	return (
		<Tooltip text={ __( 'Open Help Center' ) }>
			<Button
				onClick={ handleOnClick }
				className={ clsx( 'sidebar__item-help', {
					'is-active': show,
				} ) }
				icon={ <HelpIcon /> }
			/>
		</Tooltip>
	);
};

export default SidebarHelpCenter;
