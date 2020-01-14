/**
 * External dependencies
 */
import React, { Component } from 'react';

import './style.scss';

export default class ImportTypeChoice extends Component {
	state = {};

	onClickHandler = event => {
		console.log;
	};

	render() {
		return (
			<div className="import-type-choice__wrapper">
				<div className="import-type-choice__option-wrapper">
					<input type="radio" />
					<div className="import-type-choice__option-data">
						<div className="import-type-choice__option-header">
							<h3>Everything</h3>
							<div className="import-type-choice__option-token-label">Upgrade Required</div>
							<div className="import-type-choice__option-token-label">Other bubble</div>
							<div className="import-type-choice__option-token-label">Third bubble</div>
						</div>
						<div className="import-type-choice__option-description">
							All your site's content, themes, plugins, users and settings
						</div>
					</div>
				</div>
			</div>
		);
	}
}
