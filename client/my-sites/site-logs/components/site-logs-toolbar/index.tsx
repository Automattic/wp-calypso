import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

import './style.scss';

type Props = {
	onRefresh: () => void;
};

export const SiteLogsToolbar = ( props: Props ) => {
	const { onRefresh } = props;

	const { __ } = useI18n();

	return (
		<div className="site-logs-toolbar">
			<Button isSecondary onClick={ onRefresh }>
				{ __( 'Refresh' ) }
			</Button>
		</div>
	);
};
