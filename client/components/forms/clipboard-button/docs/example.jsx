import { PureComponent } from 'react';
import ClipboardButton from '../';

export default class extends PureComponent {
	static displayName = 'ClipboardButtons';

	state = {
		isCopied: false,
	};

	onCopy = () => {
		this.setState( {
			isCopied: true,
		} );
	};

	render() {
		return (
			<div>
				<ClipboardButton
					onCopy={ this.onCopy }
					text="This text was copied via ClipboardButton"
					style={ { float: 'none' } }
				>
					{ this.state.isCopied ? 'Copied!' : 'Copy to clipboard' }
				</ClipboardButton>
			</div>
		);
	}
}
