/** @format */
/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { noop, map, size } from 'lodash';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';

class GravatarCaterpillar extends React.Component {
	static propTypes = {
		onClick: PropTypes.func,
	};

	render() {
		const { authors, onClick, maxGravatarsToDisplay } = this.props;

		const displayedAuthorsCount = size( authors );

		if ( displayedAuthorsCount < 1 ) {
			return null;
		}

		const gravatarSmallScreenThreshold = maxGravatarsToDisplay / 2;

		return (
			<div className="gravatar-caterpillar" onClick={ onClick } aria-hidden="true">
				{ map( authors, ( author, index ) => {
					let gravClasses = 'gravatar-caterpillar__gravatar';
					// If we have more than x gravs,
					// add a additional class so we can hide some on small screens
					if (
						displayedAuthorsCount > gravatarSmallScreenThreshold &&
						index < displayedAuthorsCount - gravatarSmallScreenThreshold
					) {
						gravClasses += ' is-hidden-on-small-screens';
					}

					return (
						<Gravatar className={ gravClasses } key={ author.email } user={ author } size={ 32 } />
					);
				} ) }
			</div>
		);
	}
}

GravatarCaterpillar.defaultProps = {
	onClick: noop,
	maxGravatarsToDisplay: 10,
};

export default GravatarCaterpillar;
