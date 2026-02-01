import { SummaryButton } from '@automattic/components';
import { globe, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';

import './style.scss';

interface Props {
	onClick: () => void;
}

export const DomainSearchAlreadyOwnDomainCTA = ( { onClick }: Props ) => {
	const { __ } = useI18n();

	return (
		<SummaryButton
			className="domain-search-already-own-domain-cta"
			title={ __( 'Already have a domain?' ) }
			description={ __( 'Bring it over to WordPress.com.' ) }
			decoration={ <Icon icon={ globe } /> }
			onClick={ onClick }
		/>
	);
};
