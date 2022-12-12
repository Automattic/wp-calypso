import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import SupportInfo from 'calypso/components/support-info';

const BloggingPrompts = ( {
	fields,
	handleToggle,
	isRequestingSettings,
	isSavingSettings,
	isAtomic,
	siteIsJetpack,
} ) => {
	const translate = useTranslate();

	return (
		<Card className="composing__card site-settings__card">
			<SupportInfo
				text={ translate( 'Displays a writing prompt when starting a new post.' ) }
				link="https://wordpress.com/support/writing-prompts"
				privacyLink={ siteIsJetpack && ! isAtomic }
			/>
			<ToggleControl
				checked={ !! fields.jetpack_blogging_prompts_enabled }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleToggle( 'jetpack_blogging_prompts_enabled' ) }
				label={ translate( 'Show writing prompts' ) }
			/>
		</Card>
	);
};

BloggingPrompts.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

BloggingPrompts.propTypes = {
	handleToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
	isAtomic: PropTypes.bool,
	siteIsJetpack: PropTypes.bool,
};

export default BloggingPrompts;
