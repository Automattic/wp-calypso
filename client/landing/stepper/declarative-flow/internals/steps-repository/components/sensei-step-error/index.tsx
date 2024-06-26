import { CALYPSO_CONTACT } from '@automattic/urls';
import { useI18n } from '@wordpress/react-i18n';
import { Container, Title, ErrorIcon, TryAgain, ContactSupport } from './components';

export const SenseiStepError = () => {
	const { __ } = useI18n();
	return (
		<Container>
			<ErrorIcon />
			<Title>{ __( 'Something went wrong' ) }</Title>
			<TryAgain onClick={ () => location.replace( location.href ) }>{ __( 'Try Again' ) }</TryAgain>
			<ContactSupport>
				<a href={ CALYPSO_CONTACT }>{ __( 'Contact Support' ) }</a>
			</ContactSupport>
		</Container>
	);
};
