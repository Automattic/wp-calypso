import { SummaryButton } from '@automattic/components';
import { Icon, update } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';

import './style.scss';

interface Props {
	onClick: () => void;
}

export const DomainSearchAlreadyHaveSiteCTA = ( { onClick }: Props ) => {
	const { __ } = useI18n();

	return (
		<SummaryButton
			className="domain-search-already-have-site-cta"
			title={ __( 'Already have a site?' ) }
			description={ __( 'Move it from any host or platform.' ) }
			decoration={ <Icon icon={ update } className="domain-search-already-have-site-cta__icon" /> }
			onClick={ onClick }
		/>
	);
};
