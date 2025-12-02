import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';

import './submit.scss';

export const DomainSearchControlsSubmit = ( { onClick }: { onClick?: () => void } ) => {
	const { __ } = useI18n();
	return (
		<Button
			variant="primary"
			type="submit"
			className="domain-search-controls__submit"
			onClick={ onClick }
		>
			{ __( 'Search domains' ) }
		</Button>
	);
};
