import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import './notice.scss';

const GlobalStylesNotice = () => {
	return (
		<Notice status="warning" isDismissible={ false } className="wpcom-global-styles-notice">
			{ __(
				"Your style changes won't be public until you upgrade your plan. You can revert your styles.",
				'full-site-editing'
			) }
		</Notice>
	);
};

export default GlobalStylesNotice;
