/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { Button, CompactCard } from '@automattic/components';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';

/**
 * Style dependencies
 */
import './section-migrate.scss';

class StepUpgrade extends Component {
	static propTypes = {
		startMigration: PropTypes.func.isRequired,
	};

	render() {
		return (
			<>
				<HeaderCake>Import Everything</HeaderCake>

				<CompactCard>
					<Button onClick={ this.props.startMigration } primary>
						Upgrade and import
					</Button>
				</CompactCard>
			</>
		);
	}
}

export default localize( StepUpgrade );
