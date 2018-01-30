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
		title: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object, PropTypes.array ] )
			.isRequired,
		description: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object, PropTypes.array ] )
			.isRequired,
		action: PropTypes.func,
		actionLabel: PropTypes.string.isRequired,
		backgroundColor: PropTypes.string,
		image: PropTypes.string,
		imageAttrs: PropTypes.shape( {
			alt: PropTypes.string,
			width: PropTypes.number,
		} ),
		imageTransform: PropTypes.string,
		href: PropTypes.string,
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
			href,
		} = this.props;
		const backgroundStyle = backgroundColor ? { backgroundColor } : {};
		const imageNode = image ? (
			<img
				alt=""
				{ ...imageAttrs }
				src={ safeImageUrl( image ) }
				style={ { transform: imageTransform } }
			/>
		) : null;
		return (
			<div className="themes-banner" style={ backgroundStyle }>
				<h1>{ title }</h1>
				<p>{ description }</p>
				<Button compact primary onClick={ action } href={ href }>
					{ actionLabel }
				</Button>
				{ imageNode }
			</div>
		);
	}
}
