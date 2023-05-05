import { ToggleControl as OriginalToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';

// This is a fix to get around the fact that the original ToggleControl component doesn't support the disabled prop.
// TODO: Remove this when the original ToggleControl component supports the disabled prop.
const ToggleControl = OriginalToggleControl as React.ComponentType<
	OriginalToggleControl.Props & {
		disabled?: boolean;
	}
>;

type EmailMeNewCommentsToggleProps = {
	value: boolean;
	isUpdating: boolean;
	onChange: ( value: boolean ) => void;
};

const EmailMeNewCommentsToggle = ( {
	value = false,
	isUpdating = false,
	onChange,
}: EmailMeNewCommentsToggleProps ) => {
	const translate = useTranslate();

	return (
		<PopoverMenuItem
			itemComponent="div"
			focusOnHover={ false }
			className="settings-popover__email-me-new-comments-item"
		>
			<ToggleControl
				className="settings-popover__email-me-new-comments-toggle"
				label={ translate( 'Email me new comments' ) }
				onChange={ () => onChange( ! value ) }
				checked={ value }
				disabled={ isUpdating }
			/>
		</PopoverMenuItem>
	);
};

export default EmailMeNewCommentsToggle;
