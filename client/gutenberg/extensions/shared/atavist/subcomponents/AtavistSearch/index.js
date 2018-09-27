/**
 * Wordpress dependencies
 */

import { Component, createRef } from '@wordpress/element';

/**
 * External dependencies
 */

 import classnames from 'classnames';

/**
 * Internal dependencies
 */

import './style.scss';

export class AtavistSearch extends Component {
	constructor() {
		super( ...arguments );
		this.searchClicked = this.searchClicked.bind(this);
		this.inputRef = createRef();
		this.state = {
			isShown: false
		};
	}
	componentDidMount() {
		this.searchClicked = this.searchClicked.bind(this);
		// document.addEventListener('mousedown', this._activity_outside.bind(this));
	}
	searchClicked(e) {
		const { isShown } = this.state;
		this.setState( { isShown: ! isShown } );
		this.inputRef.current.focus();
	}
	render() {
		const { isShown } = this.state;
		const { searchClicked, inputRef } = this;
		const classes = classnames( 'atavist-search', isShown ? 'show' : 'hide' );
		return (
			<div className={ classes } onClick={ searchClicked }>
				<div className="search-icon">
					<svg>
					    <g stroke='#000' fill='none' fillRule='evenodd'>
					        <path d='M0,15 L3,12' strokeWidth='3' transform='matrix(-1 0 0 1 15 1)'
					        />
					        <path d='M8,12 C11.3137085,12 14,9.3137085 14,6 C14,2.6862915 11.3137085,0 8,0 C4.6862915,0 2,2.6862915 2,6 C2,9.3137085 4.6862915,12 8,12 L8,12 Z'
					        strokeWidth='2' transform='matrix(-1 0 0 1 15 1)' />
					    </g>
					</svg>
				</div>
				<form className="search-form" target="_self">
					<input type="text" id="search" name="search" placeholder="Search" ref={ inputRef } />
				</form>
			</div>
    	);
  	}
}

export default AtavistSearch;
