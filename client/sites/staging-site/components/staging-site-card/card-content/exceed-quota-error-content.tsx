import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import Notice from 'calypso/components/notice';

const ExceedQuotaErrorWrapper = styled.div( {
	marginTop: '1em',
} );

export const ExceedQuotaErrorContent = () => {
	const { __ } = useI18n();
	return (
		<ExceedQuotaErrorWrapper data-testid="quota-message">
			<Notice status="is-warning" showDismiss={ false }>
				{ __(
					'Your available storage space is lower than 50%, which is insufficient for creating a staging site.'
				) }
			</Notice>
		</ExceedQuotaErrorWrapper>
	);
};
