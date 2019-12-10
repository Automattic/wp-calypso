/**
 * External dependencies
 */

import Gridicon from 'components/gridicon';
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ScreenReaderText from '@automattic/components/screen-reader-text';

/**
 * Style dependences
 */
import './style.scss';

export class RemoveButton extends React.Component {
	static propTypes = {
		onRemove: PropTypes.func.isRequired,

		// Inherited
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { onRemove, translate } = this.props;

		return (
			<Button onClick={ onRemove } compact className="remove-button">
				<ScreenReaderText>{ translate( 'Remove' ) }</ScreenReaderText>
				<Gridicon icon="cross" size={ 24 } className="remove-button__icon" />
			</Button>
		);
	}
}

export default localize( RemoveButton );
