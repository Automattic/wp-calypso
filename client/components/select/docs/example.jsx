/**
 * External dependencies
 */

import React from 'react';

class Selects extends React.PureComponent {
	render() {
		return (
			<div className="docs__design-group">
				<h2>
					<a href="/devdocs/design/selects">Selects</a>
				</h2>
				<label>
					Label
					<select>
						<option>Item One</option>
						<option>Item Two</option>
						<option>Item Three</option>
						<option>Item Four</option>
					</select>
				</label>

				<br />

				<p>
					Pack my
					<select className="is-compact">
						<option>box</option>
						<option>closet</option>
						<option>suitcase</option>
					</select>
					with
					<select className="is-compact" defaultValue={ 10 }>
						<option>5</option>
						<option>10</option>
						<option>15</option>
					</select>
					dozen liquor jugs.
				</p>
			</div>
		);
	}
}

export default Selects;
