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
import Gridicon from 'components/gridicon';
import HeaderCake from 'components/header-cake';
import Site from 'blocks/site';

/**
 * Style dependencies
 */
import './section-migrate.scss';
import ImportTypeChoice from 'my-sites/migrate/components/import-type-choice';
import MigrateButton from 'my-sites/migrate/migrate-button';
import { get } from 'lodash';
import { redirectTo } from 'my-sites/migrate/helpers';

class StepImportOrMigrate extends Component {
	static propTypes = {
		onJetpackSelect: PropTypes.func.isRequired,
		targetSite: PropTypes.object.isRequired,
		targetSiteSlug: PropTypes.string.isRequired,
	};

	state = {
		chosenImportType: null,
	};

	chooseImportType = type => {
		this.setState( { chosenImportType: type } );
	};

	handleImportRedirect = () => {
		const { isTargetSiteAtomic, targetSiteSlug } = this.props;

		if ( isTargetSiteAtomic ) {
			window.location.href = `https://${ targetSiteSlug }/wp-admin/import.php`;
		} else {
			redirectTo( `/import/${ targetSiteSlug }/?engine=wordpress` );
		}
	};

	getJetpackOrUpgradeMessage = () => {
		const { sourceSite, sourceSiteHasJetpack, isTargetSiteAtomic } = this.props;

		if ( ! sourceSiteHasJetpack ) {
			const sourceSiteDomain = get( sourceSite, 'domain' );
			return (
				<p>
					You need to have{ ' ' }
					<a href={ `https://wordpress.com/jetpack/connect/install?url=${ sourceSiteDomain }` }>
						Jetpack
					</a>{ ' ' }
					installed on your site to be able to import over everything
				</p>
			);
		}

		if ( ! isTargetSiteAtomic ) {
			return (
				<p>A Business Plan (i) is required to import everything. Importing only content is free.</p>
			);
		}
	};

	render() {
		const { targetSite, targetSiteSlug, sourceHasJetpack } = this.props;
		const backHref = `/migrate/${ targetSiteSlug }`;

		const targetSiteDomain = get( targetSite, 'domain' );

		return (
			<>
				<HeaderCake backHref={ backHref }>Import from WordPress</HeaderCake>
				<CompactCard className="migrate__sites">
					<Gridicon className="migrate__sites-arrow" icon="arrow-right" />
					<Site site={ targetSite } indicator={ false } />
				</CompactCard>
				<CompactCard>
					<h3>What do you want to import?</h3>

					{ this.getJetpackOrUpgradeMessage() }
					<ImportTypeChoice
						onChange={ this.chooseImportType }
						radioOptions={ {
							everything: {
								title: 'Everything',
								labels: [ 'Upgrade Required', 'Something Else', 'Third bubble' ],
								description: "All your site's content, themes, plugins, users and settings",
								enabled: sourceHasJetpack,
							},
							'content-only': {
								key: 'content-only',
								title: 'Content only',
								labels: [ 'Free', 'Only content', 'Third bubble' ],
								description: 'Import posts, pages, comments, and media.',
								enabled: true,
							},
						} }
					/>
					<div className="migrate__buttons-wrapper">
						{ this.state.chosenImportType === 'everything' ? (
							<MigrateButton
								onClick={ this.props.onJetpackSelect }
								targetSiteDomain={ targetSiteDomain }
							/>
						) : null }
						{ this.state.chosenImportType === 'content-only' ? (
							<Button primary onClick={ this.handleImportRedirect }>
								Continue
							</Button>
						) : null }

						<Button className="migrate__cancel" href={ backHref }>
							Cancel
						</Button>
					</div>
				</CompactCard>
			</>
		);
	}
}

export default localize( StepImportOrMigrate );
