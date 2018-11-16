/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class SiteMockup extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			isOffscreen: true,
			isPeeking: false,
			isSideBySide: false,
			isGrouped: true,
		};
	}

	buttonIntroduce = event => {
		this.setState( {
			isOffscreen: false,
			isPeeking: true,
			isGrouped: true,
		} );
	};

	buttonCenterStage = event => {
		this.setState( {
			isOffscreen: false,
			isPeeking: false,
			isGrouped: false,
			isSideBySide: true,
		} );
	};

	buttonReset = event => {
		this.setState( {
			isOffscreen: true,
			isPeeking: false,
			isSideBySide: false,
			isGrouped: true,
		} );
	};

	getMockupChromeDesktop() {
		return (
			<div className="site-mockup__chrome-desktop">
				<svg width="38" height="10">
					<g>
						<rect width="10" height="10" rx="5" />
						<rect x="14" width="10" height="10" rx="5" />
						<rect x="28" width="10" height="10" rx="5" />
					</g>
				</svg>
			</div>
		);
	}

	getMockupChromeMobile() {
		return (
			<div className="site-mockup__chrome-mobile">
				<div className="site-mockup__chrome-mobile-top">
					<svg width="30" height="8">
						<rect width="30" height="8" rx="4" />
					</svg>
				</div>
				<div className="site-mockup__chrome-mobile-bottom" />
			</div>
		);
	}

	getMockupTitle() {
		return <div className="site-mockup__title">Mexican Restaurant</div>;
	}

	getMockupTagline() {
		return (
			<div className="site-mockup__tagline">123 Merry Ln, New York, NY &bull; (321) 123-1234</div>
		);
	}

	getMockupContent() {
		return (
			<div className="site-mockup__content">
				<div className="site-mockup__cover-image">
					<span>Fresh and authentic Mexican food.</span>
				</div>
				<div className="site-mockup__image-text">
					<img src="https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=be3aa106f944edc77c68fcd567c22bbb&auto=format&fit=crop&w=200&h=200&q=50" />
					<span>
						Enjoy a unique mix of classic Mexican dishes and innovative house specialties.
					</span>
				</div>
				<div className="site-mockup__image-text">
					<span>
						Enjoy a unique mix of classic Mexican dishes and innovative house specialties.
					</span>
					<img src="https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=8479a73ae3b8e556bada71a2b661adac&auto=format&fit=crop&w=200&q=50" />
				</div>
				<div className="site-mockup__image-text">
					<img src="https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=be3aa106f944edc77c68fcd567c22bbb&auto=format&fit=crop&w=200&h=200&q=50" />
					<span>
						Enjoy a unique mix of classic Mexican dishes and innovative house specialties.
					</span>
				</div>
				<div className="site-mockup__image-text">
					<span>
						Enjoy a unique mix of classic Mexican dishes and innovative house specialties.
					</span>
					<img src="https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=8479a73ae3b8e556bada71a2b661adac&auto=format&fit=crop&w=200&q=50" />
				</div>
			</div>
		);
	}

	getMockupPlaceholders() {
		return (
			<div className="site-mockup__placeholders">
				<div className="site-mockup__placeholder" />
				<div className="site-mockup__placeholder" />
				<div className="site-mockup__placeholder" />
			</div>
		);
	}

	render() {
		var siteMockupClasses = classNames( {
			'site-mockup__wrap': true,
			'is-side-by-side': this.state.isSideBySide,
			'is-grouped': this.state.isGrouped,
			'is-offscreen': this.state.isOffscreen,
			'is-peeking': this.state.isPeeking,
		} );

		return (
			<div className={ siteMockupClasses }>
				<div className="site-mockup__demo-button">
					<button onClick={ this.buttonIntroduce }>Introduce</button>
					<button onClick={ this.buttonCenterStage }>Center Stage</button>
					<button onClick={ this.buttonReset }>Reset</button>
				</div>
				<div className="site-mockup__viewport desktop">
					{ this.getMockupChromeDesktop() }
					<div className="site-mockup__body">{ this.getMockupPlaceholders() }</div>
				</div>

				<div className="site-mockup__viewport mobile">
					{ this.getMockupChromeMobile() }
					<div className="site-mockup__body">{ this.getMockupPlaceholders() }</div>
				</div>
			</div>
		);
	}
}
