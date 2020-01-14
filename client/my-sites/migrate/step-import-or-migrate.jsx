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
import CardHeading from 'components/card-heading';
import Gridicon from 'components/gridicon';
import HeaderCake from 'components/header-cake';
import Site from 'blocks/site';

/**
 * Style dependencies
 */
import './section-migrate.scss';

class StepImportOrMigrate extends Component {
	static propTypes = {
		targetSite: PropTypes.object.isRequired,
		targetSiteSlug: PropTypes.string.isRequired,
	};

	render() {
		const { targetSite, targetSiteSlug } = this.props;
		const backHref = `/migrate/${ targetSiteSlug }`;

		return (
			<>
				<HeaderCake backHref={ backHref }>Import from WordPress</HeaderCake>
				<CompactCard className="migrate__sites">
					<Gridicon className="migrate__sites-arrow" icon="arrow-right" />
					<Site site={ targetSite } indicator={ false } />
				</CompactCard>
				<CompactCard>
					<CardHeading>What do you want to import?</CardHeading>
					<Button>Continue</Button>
				</CompactCard>
			</>
		);
	}
}

export default localize( StepImportOrMigrate );
