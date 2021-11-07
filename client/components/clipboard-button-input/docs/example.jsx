import { PureComponent } from 'react';
import ClipboardButtonInput from '../';

export default class extends PureComponent {
	static displayName = 'ClipboardButtonInput';

	render() {
		return (
			<div>
				<ClipboardButtonInput value="https://example.wordpress.com/" />
			</div>
		);
	}
}
