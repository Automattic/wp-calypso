import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import SupportInfo from 'calypso/components/support-info';

const Markdown = ( {
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
				text={ translate(
					'Use Markdown syntax to compose content with links, lists, and other styles. This setting enables Markdown in the Classic Editor as well as within a Classic Editor block.'
				) }
				link={
					siteIsJetpack && ! isAtomic
						? 'https://jetpack.com/support/markdown/'
						: localizeUrl( 'https://wordpress.com/support/markdown-quick-reference/' )
				}
				privacyLink={ siteIsJetpack && ! isAtomic }
			/>
			<ToggleControl
				checked={ !! fields.wpcom_publish_posts_with_markdown }
				disabled={ isRequestingSettings || isSavingSettings }
				onChange={ handleToggle( 'wpcom_publish_posts_with_markdown' ) }
				label={ translate( 'Write posts or pages in plain text Markdown syntax.' ) }
			/>
		</Card>
	);
};

Markdown.defaultProps = {
	isSavingSettings: false,
	isRequestingSettings: true,
	fields: {},
};

Markdown.propTypes = {
	handleToggle: PropTypes.func.isRequired,
	isSavingSettings: PropTypes.bool,
	isRequestingSettings: PropTypes.bool,
	fields: PropTypes.object,
	isAtomic: PropTypes.bool,
	siteIsJetpack: PropTypes.bool,
};

export default Markdown;
