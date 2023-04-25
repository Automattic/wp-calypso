import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

type EmailMeNewCommentsToggleProps = {
	isUpdating: boolean;
};

const EmailMeNewCommentsToggle = ( { isUpdating = false }: EmailMeNewCommentsToggleProps ) => {
	const translate = useTranslate();

	return (
		<PopoverMenuItem itemComponent="div">
			<ToggleControl
				className="settings-popover__email-me-new-comments-toggle"
				label={ translate( 'Email me new comments' ) }
				onChange={ () => null }
				checked={ false }
				disabled={ isUpdating }
			/>
		</PopoverMenuItem>
	);
};

export default EmailMeNewCommentsToggle;
