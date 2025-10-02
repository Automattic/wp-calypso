import { TransferStepComponentProps } from '../types';
import { Login } from './login';

export function TransferLogin( props: TransferStepComponentProps ) {
	return (
		<Login
			domainName={ props.domainName }
			onNextStep={ props.onNextStep }
			isOwnershipVerificationFlow={ false }
		/>
	);
}
