import { HelpIcon } from '@automattic/help-center';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';

const SidebarHelpCenter = () => {
	const { toggleHelpCenter, show } = useHelpCenter();

	return (
		<>
			<Button
				onClick={ toggleHelpCenter }
				className={ clsx( 'sidebar__item-help', {
					'is-active': show,
				} ) }
				icon={ <HelpIcon /> }
			/>
		</>
	);
};

export default SidebarHelpCenter;
