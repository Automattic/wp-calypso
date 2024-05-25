import debugFactory from 'debug';
import { Component } from 'react';

const debug = debugFactory( 'calypso:my-sites:site' );

export default class extends Component {
	static displayName = 'SitePlaceholder';

	componentDidMount() {
		debug( 'The Site component is mounted.' );
	}

	render() {
		return (
			<div className="site is-loading">
				<div className="site__content">
					<div className="site-icon" />
					<div className="site__info">
						<div className="site__title">This is an example</div>
						<div className="site__domain">example.wordpress.com</div>
					</div>
				</div>
			</div>
		);
	}
}
