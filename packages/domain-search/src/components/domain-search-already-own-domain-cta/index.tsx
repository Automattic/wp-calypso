import { SummaryButton } from '@automattic/components';
import { globe, Icon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';

interface Props {
	onClick: () => void;
}

export const DomainSearchAlreadyOwnDomainCTA = ( { onClick }: Props ) => {
	const { __ } = useI18n();

	return (
		<SummaryButton
			title={ __( 'Already have a domain?' ) }
			description={ __( 'Connect a domain you already own to WordPress.com.' ) }
			decoration={ <Icon icon={ globe } /> }
			onClick={ onClick }
		/>
	);
};
