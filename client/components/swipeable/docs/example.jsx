import { PureComponent } from 'react';
import Swipeable from 'calypso/components/swipeable';

export default class extends PureComponent {
	static displayName = 'Swipeable';

	constructor( props ) {
		super( props );
		this.state = { currentPage: 0 };
	}

	render() {
		return (
			<Swipeable
				onPageSelect={ ( index ) => {
					this.setState( { currentPage: index } );
				} }
				currentPage={ this.state.currentPage }
				pageClassName="example-page-component-class"
				hasDynamicHeight
			>
				<div>Page 1</div>
				<div>Page 2</div>
				<div>Page 3</div>
			</Swipeable>
		);
	}
}
