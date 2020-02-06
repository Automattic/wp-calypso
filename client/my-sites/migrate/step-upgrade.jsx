/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { CompactCard } from '@automattic/components';

/**
 * Internal dependencies
 */
import HeaderCake from 'components/header-cake';
import MigrateButton from './migrate-button.jsx';

/**
 * Style dependencies
 */
import './section-migrate.scss';

class StepUpgrade extends Component {
	static propTypes = {
		startMigration: PropTypes.func.isRequired,
		targetSite: PropTypes.object.isRequired,
	};

	render() {
		const { targetSite } = this.props;
		const targetSiteDomain = get( targetSite, 'domain' );

		return (
			<>
				<HeaderCake>Import Everything</HeaderCake>

				<CompactCard>
					<MigrateButton
						onClick={ this.props.startMigration }
						targetSiteDomain={ targetSiteDomain }
					>
						Upgrade and import
					</MigrateButton>
				</CompactCard>
			</>
		);
	}
}

export default localize( StepUpgrade );
