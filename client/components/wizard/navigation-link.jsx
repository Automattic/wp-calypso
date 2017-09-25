/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class NavigationLink extends Component {
	static propTypes = {
		direction: PropTypes.oneOf( [ 'back', 'forward' ] ).isRequired,
		href: PropTypes.string,
		text: PropTypes.string,
		translate: PropTypes.func.isRequired,
	}

	getText = () => {
		const { direction, text, translate } = this.props;

		return text || ( direction === 'back' ? translate( 'Back' ) : translate( 'Skip for now' ) );
	}

	render() {
		const { direction, href } = this.props;

		return (
			<Button compact borderless
				className="wizard__navigation-link"
				href={ href }>
				{ direction === 'back' && <Gridicon icon="arrow-left" size={ 18 } /> }
				{ this.getText() }
				{ direction === 'forward' && <Gridicon icon="arrow-right" size={ 18 } /> }
			</Button>
		);
	}
}

export default localize( NavigationLink );
