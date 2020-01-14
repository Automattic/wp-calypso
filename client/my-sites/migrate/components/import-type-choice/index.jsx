/**
 * External dependencies
 */
import React, { Component } from 'react';

import './style.scss';

const choices = [
	{
		key: 'everything',
		title: 'Everything',
		labels: ['Upgrade Required', 'Something Else', 'Third bubble'],
		description: 'All your site\'s content, themes, plugins, users and settings',
	},
	{
		key: 'content-only',
		title: 'Content only',
		labels: ['Free', 'Only content', 'Third bubble'],
		description: 'Import posts, pages, comments, and media.',
	}
];


export default class ImportTypeChoice extends Component {
	componentDidMount = () => {

	};

	onClickHandler = event => {
		event.preventDefault();

		const chosenItem = event.currentTarget.dataset.key;

		if ( !chosenItem ) {
			return;
		}

		if ( this.state.activeItem !== chosenItem ) {
			this.setState( { activeItem: chosenItem } );
			// this.props.onChange( chosenItem ); // TODO implement
		}
	};

	onKeyPressHandler = event => {
		// TODO implement this to act on enter key
		event.preventDefault();
		console.log( event );
	};

	render() {

		const items = choices; // TODO pass as props

		return (
			<div className="import-type-choice__wrapper">
				{items.map( item => (
					<div
						className="import-type-choice__option-wrapper"
						onClick={this.onClickHandler}
						onKeyPress={this.onKeyPressHandler}
						role="button"
						tabIndex={0}
						data-key={item.key}
						key={item.key}
					>
						<input
							type="radio"
							checked={this.state.activeItem === item.key}
							readOnly={true}
						/>
						<div className="import-type-choice__option-data">
							<div className="import-type-choice__option-header">
								<h3>{item.title}</h3>

								{item.labels.map( ( label, idx ) => (
									<div
										className="import-type-choice__option-token-label"
										key={idx}
									>
										{label}
									</div>
								) )}
							</div>
							<div className="import-type-choice__option-description">
								{item.description}
							</div>
						</div>
					</div>
				) )}
			</div>
		);
	}
}
