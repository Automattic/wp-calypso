/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class SiteMockup extends Component {
	/*
	static propTypes = {
		compact: PropTypes.bool,
		primary: PropTypes.bool,
		scary: PropTypes.bool,
		busy: PropTypes.bool,
		type: PropTypes.string,
		href: PropTypes.string,
		borderless: PropTypes.bool,
		target: PropTypes.string,
		rel: PropTypes.string,
	};

	static defaultProps = {
		type: 'button',
	};
*/
	getPreviewAddress() {
		return (
			<div className="site__address-bar">
				<ul className="address">
					<li className="address__detail street-addresss">
						2011 Grinstead Dr, Suite 104, Louisville KY. 40204
					</li>
					<li className="address__detail phone">502-409-7499</li>
					<li className="address__detail email">fatlamblouisville@gmail.com</li>
				</ul>
			</div>
		);
	}
	getTitle() {
		return (
			<div className="site__title-bar">
				<h1>The Fat Lamb</h1>
			</div>
		);
	}
	getHero() {
		return (
			<div className="site__hero-shot">
				<h2>Welcome to our Italian Restaurant</h2>
				<p>Fresh authentic cuisine in the Louisville area</p>
				<img
					className="site__hero-image"
					src="https://wprestaurant002.files.wordpress.com/2018/10/pexels-photo-67468.jpeg"
				/>
			</div>
		);
	}
	getPreviewBody() {
		return (
			<div className="site-preview__content">
				<h2>Dedicated to quality</h2>
				<p>Enjoy a unique mix of classic dishes and innovative house specialties.</p>
				<h2>A local favorite</h2>
				<p>
					Proud to be a local Louisville business. Our delightful service close to home will make
					you feel like family.
				</p>
			</div>
		);
	}
	getPreview() {
		return (
			<div className="about__preview">
				<div className="site-shell">
					{ this.getPreviewAddress() }
					{ this.getTitle() }
					{ this.getHero() }
					{ this.getPreviewBody() }
				</div>
			</div>
		);
	}

	render() {
		return (
			<div class="previews pinned introduce demo">
				<div class="preview preview-desktop">
					<div class="preview-chrome" />
					<div class="preview-content">
						<div class="modern-demo">
							<div class="demo-title">Mexican Restaurant</div>
							<div class="demo-tagline">123 Merry Ln, New York, NY &bull; (321) 123-1234</div>
							<div class="demo-cover-image">
								<span>Fresh and authentic Mexican food.</span>
							</div>
							<div class="demo-image-text">
								<img src="https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=be3aa106f944edc77c68fcd567c22bbb&auto=format&fit=crop&w=200&h=200&q=50" />
								<span>
									Enjoy a unique mix of classic Mexican dishes and innovative house specialties.
								</span>
							</div>
							<div class="demo-image-text">
								<span>
									Enjoy a unique mix of classic Mexican dishes and innovative house specialties.
								</span>
								<img src="https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=8479a73ae3b8e556bada71a2b661adac&auto=format&fit=crop&w=200&q=50" />
							</div>
							<div class="demo-image-text">
								<img src="https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=be3aa106f944edc77c68fcd567c22bbb&auto=format&fit=crop&w=200&h=200&q=50" />
								<span>
									Enjoy a unique mix of classic Mexican dishes and innovative house specialties.
								</span>
							</div>
							<div class="demo-image-text">
								<span>
									Enjoy a unique mix of classic Mexican dishes and innovative house specialties.
								</span>
								<img src="https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=8479a73ae3b8e556bada71a2b661adac&auto=format&fit=crop&w=200&q=50" />
							</div>
						</div>
						<div class="preview-placeholder" />
						<div class="preview-placeholder" />
						<div class="preview-placeholder" />
					</div>
				</div>
				<div class="preview preview-mobile">
					<div class="preview-chrome" />
					<div class="preview-content">
						<div class="modern-demo">
							<div class="demo-title">Mexican Restaurant</div>
							<div class="demo-tagline">123 Merry Ln, New York, NY &bull; (321) 123-1234</div>
							<div class="demo-cover-image">
								<span>Fresh and authentic Mexican food.</span>
							</div>
							<div class="demo-image-text">
								<img src="https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=be3aa106f944edc77c68fcd567c22bbb&auto=format&fit=crop&w=200&h=200&q=50" />
								<span>
									Enjoy a unique mix of classic Mexican dishes and innovative house specialties.
								</span>
							</div>
							<div class="demo-image-text">
								<span>
									Enjoy a unique mix of classic Mexican dishes and innovative house specialties.
								</span>
								<img src="https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=8479a73ae3b8e556bada71a2b661adac&auto=format&fit=crop&w=200&q=50" />
							</div>
							<div class="demo-image-text">
								<img src="https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=be3aa106f944edc77c68fcd567c22bbb&auto=format&fit=crop&w=200&h=200&q=50" />
								<span>
									Enjoy a unique mix of classic Mexican dishes and innovative house specialties.
								</span>
							</div>
							<div class="demo-image-text">
								<span>
									Enjoy a unique mix of classic Mexican dishes and innovative house specialties.
								</span>
								<img src="https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=8479a73ae3b8e556bada71a2b661adac&auto=format&fit=crop&w=200&q=50" />
							</div>
						</div>
						<div class="preview-placeholder" />
						<div class="preview-placeholder" />
						<div class="preview-placeholder" />
					</div>
					<div class="preview-chin" />
				</div>
			</div>
			/*
		const className = classNames( 'button', this.props.className, {
			'is-compact': this.props.compact,
			'is-primary': this.props.primary,
			'is-scary': this.props.scary,
			'is-busy': this.props.busy,
			'is-borderless': this.props.borderless,
		} );

		if ( this.props.href ) {
			const { compact, primary, scary, busy, borderless, type, ...props } = this.props;

			// block referrers when external link
			const rel = props.target
				? ( props.rel || '' ).replace( /noopener|noreferrer/g, '' ) + ' noopener noreferrer'
				: props.rel;

			return <a { ...props } rel={ rel } className={ className } />;
		}

		const { compact, primary, scary, busy, borderless, target, rel, ...props } = this.props;

		return <button { ...props } className={ className } />;
		*/
		);
	}
}
