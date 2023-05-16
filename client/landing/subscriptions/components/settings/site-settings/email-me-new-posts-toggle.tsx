import { ToggleControl as OriginalToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

// This is a fix to get around the fact that the original ToggleControl component doesn't support the disabled prop.
// TODO: Remove this when the original ToggleControl component supports the disabled prop.
const ToggleControl = OriginalToggleControl as React.ComponentType<
	OriginalToggleControl.Props & {
		disabled?: boolean;
	}
>;

type EmailMeNewPostsToggleProps = {
	value: boolean;
	isUpdating: boolean;
	onChange: ( value: boolean ) => void;
};

const EmailMeNewPostsToggle = ( {
	value = false,
	isUpdating = false,
	onChange,
}: EmailMeNewPostsToggleProps ) => {
	const translate = useTranslate();

	return (
		<div className="setting-item">
			<ToggleControl
				label={ translate( 'Email me new posts' ) }
				onChange={ () => onChange( ! value ) }
				checked={ value }
				disabled={ isUpdating }
			/>
		</div>
	);
};

export default EmailMeNewPostsToggle;
