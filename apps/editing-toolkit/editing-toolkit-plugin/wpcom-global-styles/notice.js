import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const GlobalStylesNotice = () => {
	return (
		<Notice status="warning" isDismissible={ false }>
			{ __(
				"Your style changes won't be public until you upgrade your plan. Uou can revert your styles.",
				'full-site-editing'
			) }
		</Notice>
	);
};

export default GlobalStylesNotice;
