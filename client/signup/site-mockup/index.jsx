/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSiteTitle } from 'state/signup/steps/site-title/selectors';
import getSiteTopic from 'state/selectors/get-signup-steps-site-topic';

class SiteMockup extends Component {
	static propTypes = {
		title: PropTypes.string,
		tagline: PropTypes.string,
		address: PropTypes.string,
		phone: PropTypes.string,
		vertical: PropTypes.string,
	};

	static defaultProps = {
		title: 'Default Title',
		vertical: 'Mexican Food',
	};

	constructor( props ) {
		super( props );

		this.state = {
			isOffscreen: true,
			isPeeking: false,
			isSideBySide: false,
			isGrouped: true,
		};
	}

	buttonIntroduce = () => {
		this.setState( {
			isOffscreen: false,
			isPeeking: true,
			isGrouped: true,
		} );
	};

	buttonCenterStage = () => {
		this.setState( {
			isOffscreen: false,
			isPeeking: false,
			isGrouped: false,
			isSideBySide: true,
		} );
	};

	buttonReset = () => {
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

	defaultVerticalData = {
		vertical_name: 'Default',
		vertical_id: 'a8c.0',
		preview: {
			title: 'My awesome WordPress site',
			cover_image:
				'https://images.unsplash.com/photo-1542325823-53124d9c5cbe?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=5441d8034187fec24a8d9ea0d5e634e6&auto=format&fit=crop&w=3134&q=80',
			cover_image_text: 'Imagine the Synergy',
			feature_image:
				'https://images.unsplash.com/photo-1542332213-31f87348057f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=30f348fe853a2447c6413bea9aeb859e&auto=format&fit=crop&w=200&h=200&q=50',
			headline: 'About Us',
			text: 'This site will blow your mind.',
		},
	};

	verticalList = [
		{
			vertical_name: 'Mexican Restaurant',
			vertical_id: 'a8c.3.0.4.1',
			parent: 'a8c.3.0.4',
			preview: {
				title: 'Very Cool Mexican Restaurant',
				cover_image:
					'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=cc14d05af9963bb8ee521c3c4ea6df55&auto=format&fit=crop&w=3134&q=80',
				cover_image_text: 'Fresh and authentic Mexican food.',
				feature_image:
					'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=be3aa106f944edc77c68fcd567c22bbb&auto=format&fit=crop&w=200&h=200&q=50',
				headline: 'About Us',
				text: 'Enjoy a unique mix of classic Mexican dishes and innovative house specialties.',
			},
		},
	];

	normalizeVerticalName( name ) {
		return name
			.trim()
			.toLowerCase()
			.replace( /\s/g, '-' );
	}

	getVerticalData() {
		let { vertical } = this.props;
		if ( ! vertical ) {
			return this.defaultVerticalData.preview;
		}
		vertical = this.normalizeVerticalName( vertical );
		// this probably needs to be memoized
		const verticalData = find( this.verticalList, v => {
			return this.normalizeVerticalName( v.vertical_name ) === vertical;
		} );
		// todo deal with children that have no preview, use the parent preview
		return verticalData ? verticalData.preview : this.defaultVerticalData.preview;
	}

	renderMockup( size = 'desktop' ) {
		const classes = classNames( 'site-mockup__viewport', size );
		const data = this.getVerticalData();
		return (
			<div className={ classes }>
				{ size === 'mobile' ? this.getMockupChromeMobile() : this.getMockupChromeDesktop() }
				<div className="site-mockup__body">
					<div className="site-mockup__content">
						<div
							className="site-mockup__cover-image"
							style={ { backgroundImage: `url("${ data.cover_image }")` } }
						>
							<span>{ data.cover_image_text }</span>
						</div>
						<div className="site-mockup__image-text">
							<img src={ data.feature_image } alt="" />
							<span>{ data.text }</span>
						</div>
						<div className="site-mockup__image-text">
							<span>{ data.text }</span>
							<img src={ data.feature_image } alt="" />
						</div>

						<div className="site-mockup__placeholders">
							<div className="site-mockup__placeholder" />
							<div className="site-mockup__placeholder" />
							<div className="site-mockup__placeholder" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	render() {
		const siteMockupClasses = classNames( {
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
				{ this.renderMockup( 'desktop' ) }
				{ this.renderMockup( 'mobile' ) }
			</div>
		);
	}
}

export default connect( state => {
	return {
		title: getSiteTitle( state ),
		vertical: getSiteTopic( state ),
	};
} )( SiteMockup );
