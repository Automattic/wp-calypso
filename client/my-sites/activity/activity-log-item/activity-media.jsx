/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'calypso/components/gridicon';

export default class ActivityMedia extends PureComponent {
	static propTypes = {
		icon: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		thumbnail: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		fullImage: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		name: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		className: PropTypes.string,
	};

	render() {
		const { icon, thumbnail, fullImage, name, className } = this.props;
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className={ className }>
				{ icon && <Gridicon icon={ icon } size={ 48 } /> }
				{ thumbnail && <img src={ thumbnail } alt={ name } className="is-thumbnail" /> }
				{ fullImage && <img src={ fullImage } alt={ name } className="is-full-width" /> }
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}
