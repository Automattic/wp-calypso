import { PureComponent } from 'react';
import CountedTextarea from 'calypso/components/forms/counted-textarea';

export default class extends PureComponent {
	static displayName = 'CountedTextareas';

	state = {
		value: 'Hello World!',
	};

	onChange = ( event ) => {
		this.setState( {
			value: event.target.value,
		} );
	};

	render() {
		return (
			<CountedTextarea
				value={ this.state.value }
				onChange={ this.onChange }
				acceptableLength={ 20 }
			/>
		);
	}
}
