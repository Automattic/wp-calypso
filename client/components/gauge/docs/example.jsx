import { PureComponent } from 'react';
import Gauge from 'calypso/components/gauge';

export default class extends PureComponent {
	static displayName = 'Gauge';

	render() {
		return <Gauge percentage={ 27 } metric={ 'test' } />;
	}
}
