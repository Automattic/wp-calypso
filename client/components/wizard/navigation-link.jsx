/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class NavigationLink extends Component {
	static propTypes = {
		direction: PropTypes.oneOf( [ 'back', 'forward' ] ).isRequired,
		href: PropTypes.string,
		onClick: PropTypes.func,
		text: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onClick: noop,
	};

	getText = () => {
		const { direction, text, translate } = this.props;

		return text || ( direction === 'back' ? translate( 'Back' ) : translate( 'Skip for now' ) );
	};

	render() {
		const { direction, href, onClick } = this.props;

		return (
			<Button
				compact
				borderless
				className="wizard__navigation-link"
				href={ href }
				onClick={ onClick }
			>
				{ direction === 'back' && <Gridicon icon="arrow-left" size={ 18 } /> }
				{ this.getText() }
				{ direction === 'forward' && <Gridicon icon="arrow-right" size={ 18 } /> }
			</Button>
		);
	}
}

export default localize( NavigationLink );
