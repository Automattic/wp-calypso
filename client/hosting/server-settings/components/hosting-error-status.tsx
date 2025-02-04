import { translate } from 'i18n-calypso';
import Notice from 'calypso/components/notice';
import { activateContext } from './activate-context';

interface HostingErrorStatusProps {
	context: activateContext;
}

export const HostingErrorStatus = ( { context }: HostingErrorStatusProps ) => {
	const getErrorText = () => {
		switch ( context ) {
			case 'theme':
				return translate( 'There was an error activating theme features.' );
			case 'plugin':
				return translate( 'There was an error activating plugin features.' );
			default:
				return translate( 'There was an error activating hosting features.' );
		}
	};

	return <Notice status="is-error" showDismiss={ false } text={ getErrorText() } icon="bug" />;
};
