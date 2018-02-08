/** @format */

/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cssSafeUrl from 'lib/css-safe-url';
import Button from 'components/button';

export class ThemesBanner extends PureComponent {
	static propTypes = {
		title: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		action: PropTypes.func,
		actionLabel: PropTypes.string.isRequired,
		backgroundImage: PropTypes.string,
		href: PropTypes.string,
	};

	render() {
		const { title, description, actionLabel, action, backgroundImage, href } = this.props;
		const backgroundStyle = backgroundImage
			? { backgroundImage: `url( ${ cssSafeUrl( backgroundImage ) } )` }
			: null;
		return (
			<div className="themes-banner" style={ backgroundStyle }>
				<h1>{ title }</h1>
				<p>{ description }</p>
				<Button compact primary onClick={ action } href={ href }>
					{ actionLabel }
				</Button>
			</div>
		);
	}
}
