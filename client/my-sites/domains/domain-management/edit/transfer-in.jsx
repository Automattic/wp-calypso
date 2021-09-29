import { PureComponent } from 'react';
import Edit from './index';

class TransferIn extends PureComponent {
	render() {
		return <Edit { ...this.props } isTransfer={ true } />;
	}
}

export default TransferIn;
