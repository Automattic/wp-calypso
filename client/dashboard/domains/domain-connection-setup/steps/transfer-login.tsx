import { StepComponentProps } from '../types';
import { Login } from './login';

export function TransferLogin( props: StepComponentProps ) {
	return <Login { ...props } />;
}
