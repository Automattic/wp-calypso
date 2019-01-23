/** @format */

/**
 * External dependencies
 */
import { Component } from '@wordpress/element';

export class IsoPoc extends Component {
	constructor() {
		super( ...arguments );
	}
	render() {
		const { className, children, complex, simple } = this.props;
		return (
			<div className={ className }>
				<h3>Simple:</h3>
				<p>Simple: { simple }</p>
				<h3>Complex:</h3>
				<ol>
					{ complex.map( item => (
						<li>{ item }</li>
					) ) }
				</ol>
				<h3>Children:</h3>
				{ children }
			</div>
		);
	}
}

IsoPoc.defaultProps = {
	simple: '',
	complex: [],
};
export default IsoPoc;
