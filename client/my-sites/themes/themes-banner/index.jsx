/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Button from 'components/button';
import safeImageUrl from 'lib/safe-image-url';

export class ThemesBanner extends PureComponent {
	static propTypes = {
		title: PropTypes.node.isRequired,
		description: PropTypes.node.isRequired,
		action: PropTypes.func.isRequired,
		actionLabel: PropTypes.string.isRequired,
		backgroundColor: PropTypes.string,
		image: PropTypes.string,
		imageAttrs: PropTypes.shape( {
			alt: PropTypes.string,
			width: PropTypes.number,
		} ),
		imageTransform: PropTypes.string,
	};

	render() {
		const {
			title,
			description,
			actionLabel,
			action,
			backgroundColor,
			image,
			imageAttrs = {},
			imageTransform = 'auto',
		} = this.props;
		const backgroundStyle = backgroundColor ? { backgroundColor } : {};
		const imageNode = image ? (
			<img
				alt=""
				{ ...imageAttrs }
				className="themes-banner__image"
				src={ safeImageUrl( image ) }
				style={ { transform: imageTransform } }
			/>
		) : null;
		return (
			<div className="themes-banner" style={ backgroundStyle }>
				<h1 className="themes-banner__title">{ title }</h1>
				<p className="themes-banner__description">{ description }</p>
				<Button className="themes-banner__cta" compact primary onClick={ action }>
					{ actionLabel }
				</Button>
				<Button className="themes-banner__click-placeholder" primary onClick={ action }>
					{ actionLabel }
				</Button>
				{ imageNode }
			</div>
		);
	}
}
